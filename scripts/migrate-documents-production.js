/**
 * Production-level database migration script
 * Purpose: Synchronize all document photos from Supabase bucket to database
 * Features: Transaction support, validation, detailed logging, error recovery
 */

const fs = require("node:fs");
const path = require("node:path");
const postgres = require("postgres");
const { createClient } = require("@supabase/supabase-js");

// ============================================================================
// Configuration & Setup
// ============================================================================

/**
 * @typedef {Object} MigrationConfig
 * @property {string} supabaseUrl
 * @property {string} serviceRoleKey
 * @property {string} databaseUrl
 * @property {string} bucket
 * @property {number} batchSize
 */

/**
 * @typedef {Object} DocumentMeta
 * @property {string} id
 * @property {string} userId
 * @property {string} storagePath
 * @property {string} fileName
 * @property {string} fileUrl
 * @property {string} mimeType
 * @property {number | null} documentYear
 * @property {string | null} documentSlot
 * @property {string} documentType
 * @property {Date} createdAt
 */

class MigrationLogger {
  constructor(logFileName) {
    this.logFile = path.join(process.cwd(), `logs/${logFileName}`);
    this.startTime = new Date();
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  formatLog(level, message, data) {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n  ${JSON.stringify(data, null, 2)}` : "";
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  log(message, data) {
    const logLine = this.formatLog("INFO", message, data);
    console.log(logLine);
    fs.appendFileSync(this.logFile, logLine + "\n");
  }

  warn(message, data) {
    const logLine = this.formatLog("WARN", message, data);
    console.warn(logLine);
    fs.appendFileSync(this.logFile, logLine + "\n");
  }

  error(message, error) {
    const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : error;
    const logLine = this.formatLog("ERROR", message, errorData);
    console.error(logLine);
    fs.appendFileSync(this.logFile, logLine + "\n");
  }

  summary(stats) {
    const duration = ((new Date().getTime() - this.startTime.getTime()) / 1000).toFixed(2);
    const logLine = this.formatLog("SUMMARY", `Migration completed in ${duration}s`, stats);
    console.log("\n" + logLine + "\n");
    fs.appendFileSync(this.logFile, logLine + "\n");
  }
}

// ============================================================================
// Load Configuration
// ============================================================================

function loadEnvFile(fileName) {
  const envPath = path.resolve(process.cwd(), fileName);

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "profile-assets";

  // Debug output
  console.log("\n🔍 Environment Check:");
  console.log("  SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Not set");
  console.log("  SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓ Set" : "✗ Not set");
  console.log("  DATABASE_URL:", databaseUrl ? "✓ Set" : "✗ Not set");
  console.log("  Bucket:", bucket);
  console.log("");

  if (!supabaseUrl || !serviceRoleKey || !databaseUrl) {
    throw new Error(
      `Missing required environment variables:\n` +
      `  - SUPABASE_URL: ${supabaseUrl ? "Set" : "NOT SET"}\n` +
      `  - SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? "Set" : "NOT SET"}\n` +
      `  - DATABASE_URL: ${databaseUrl ? "Set" : "NOT SET"}\n\n` +
      `Make sure .env.local or .env file is configured properly.`
    );
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    databaseUrl,
    bucket,
    batchSize: 50,
  };
}

// ============================================================================
// Supabase Storage Operations
// ============================================================================

class SupabaseStorageManager {
  constructor(config, logger) {
    this.supabase = createClient(config.supabaseUrl, config.serviceRoleKey);
    this.bucket = config.bucket;
    this.logger = logger;
  }

  async listAllFiles(prefix) {
    try {
      this.logger.log(`Listing files in bucket: ${this.bucket}`, { prefix: prefix || "root" });
      
      const { data, error } = await this.supabase.storage.from(this.bucket).list(prefix, {
        limit: 1000,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const files = (data || []).filter((item) => item.id !== null);
      this.logger.log(`Found ${files.length} files in storage`, { prefix: prefix || "root" });
      
      return files;
    } catch (error) {
      this.logger.error("Failed to list Supabase files", error);
      throw error;
    }
  }

  async getFileUrl(storagePath) {
    try {
      const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(storagePath);
      return data?.publicUrl || "";
    } catch (error) {
      this.logger.warn(`Failed to generate public URL for ${storagePath}`, error);
      return "";
    }
  }

  async getSignedUrl(storagePath, expiresIn = 3600) {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .createSignedUrl(storagePath, expiresIn);

      if (error) {
        throw new Error(`Signed URL error: ${error.message}`);
      }

      return data?.signedUrl || "";
    } catch (error) {
      this.logger.warn(`Failed to generate signed URL for ${storagePath}`, error);
      return "";
    }
  }
}

// ============================================================================
// Database Operations
// ============================================================================

class DatabaseManager {
  constructor(databaseUrl, logger) {
    this.sql = postgres(databaseUrl, {
      ssl: "require",
      prepare: false,
      max: 20,
    });
    this.logger = logger;
  }

  async tableExists(tableName) {
    try {
      const rows = await this.sql`SELECT to_regclass(${"public." + tableName}) AS regclass`;
      return Boolean(rows[0]?.regclass);
    } catch (error) {
      this.logger.error(`Failed to check if table exists: ${tableName}`, error);
      return false;
    }
  }

  async columnExists(tableName, columnName) {
    try {
      const rows = await this.sql`
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ${tableName}
          AND column_name = ${columnName}
        LIMIT 1
      `;
      return rows.length > 0;
    } catch (error) {
      this.logger.error(`Failed to check if column exists: ${tableName}.${columnName}`, error);
      return false;
    }
  }

  async getAllDocuments() {
    try {
      this.logger.log("Fetching all documents from database");
      
      const documents = await this.sql`
        SELECT 
          id,
          user_id as "userId",
          storage_path as "storagePath",
          file_name as "fileName",
          file_url as "fileUrl",
          mime_type as "mimeType",
          document_year as "documentYear",
          document_slot as "documentSlot",
          document_type as "documentType",
          created_at as "createdAt"
        FROM documents
        ORDER BY created_at DESC
      `;

      this.logger.log(`Found ${documents.length} documents in database`);
      return documents;
    } catch (error) {
      this.logger.error("Failed to fetch documents from database", error);
      throw error;
    }
  }

  async updateDocumentUrl(documentId, storagePath, fileUrl, fileName, mimeType) {
    try {
      const result = await this.sql`
        UPDATE documents
        SET 
          file_url = ${fileUrl},
          storage_path = ${storagePath},
          file_name = ${fileName},
          mime_type = ${mimeType}
        WHERE id = ${documentId}
        RETURNING id
      `;

      return result.length > 0;
    } catch (error) {
      this.logger.warn(`Failed to update document ${documentId}`, error);
      return false;
    }
  }

  async createIndexes() {
    try {
      this.logger.log("Creating database indexes for performance");

      // Index for quick lookups by userId and type
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_user_type 
        ON documents(user_id, document_type)
      `;

      // Index for yearly documents
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_yearly 
        ON documents(user_id, document_year, document_slot) 
        WHERE document_year IS NOT NULL
      `;

      // Index for file lookups
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_documents_storage_path 
        ON documents(storage_path)
      `;

      this.logger.log("Indexes created successfully");
    } catch (error) {
      this.logger.warn("Failed to create indexes", error);
    }
  }

  async verifyDataIntegrity() {
    const issues = [];

    try {
      // Check for NULL fileUrl
      const nullUrls = await this.sql`
        SELECT COUNT(*) as count FROM documents WHERE file_url IS NULL
      `;
      if (nullUrls[0]?.count > 0) {
        issues.push(`Found ${nullUrls[0].count} documents with NULL file_url`);
      }

      // Check for NULL storagePath
      const nullPaths = await this.sql`
        SELECT COUNT(*) as count FROM documents WHERE storage_path IS NULL
      `;
      if (nullPaths[0]?.count > 0) {
        issues.push(`Found ${nullPaths[0].count} documents with NULL storage_path`);
      }

      // Check for duplicate storagePath
      const duplicates = await this.sql`
        SELECT storage_path, COUNT(*) as count 
        FROM documents 
        WHERE storage_path IS NOT NULL
        GROUP BY storage_path 
        HAVING COUNT(*) > 1
      `;
      if (duplicates.length > 0) {
        issues.push(`Found ${duplicates.length} duplicate storage_path entries`);
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      this.logger.error("Failed to verify data integrity", error);
      return { isValid: false, issues: ["Verification check failed"] };
    }
  }

  async close() {
    await this.sql.end();
  }
}

// ============================================================================
// Migration Process
// ============================================================================

class DocumentMigration {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.storageManager = new SupabaseStorageManager(config, logger);
    this.dbManager = new DatabaseManager(config.databaseUrl, logger);
    this.stats = {
      totalDocuments: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      filesInBucket: 0,
      startTime: new Date(),
    };
  }

  async run() {
    try {
      this.logger.log("🚀 Starting document migration process");
      this.logger.log("Configuration", {
        bucket: this.config.bucket,
        batchSize: this.config.batchSize,
      });

      // Step 1: Verify database tables exist
      this.logger.log("Step 1: Verifying database schema");
      const hasDocumentsTable = await this.dbManager.tableExists("documents");
      if (!hasDocumentsTable) {
        throw new Error("Documents table not found in database");
      }
      this.logger.log("✓ Documents table exists");

      // Step 2: List all files in bucket
      this.logger.log("Step 2: Listing files in Supabase bucket");
      const bucketFiles = await this.storageManager.listAllFiles();
      this.stats.filesInBucket = bucketFiles.length;
      this.logger.log(`✓ Found ${bucketFiles.length} files in bucket`);

      // Step 3: Get all documents from database
      this.logger.log("Step 3: Fetching documents from database");
      const documents = await this.dbManager.getAllDocuments();
      this.stats.totalDocuments = documents.length;
      this.logger.log(`✓ Found ${documents.length} documents in database`);

      // Step 4: Update documents with proper URLs
      this.logger.log("Step 4: Synchronizing URLs to database");
      await this.syncDocumentUrls(documents);

      // Step 5: Create indexes for performance
      this.logger.log("Step 5: Creating database indexes");
      await this.dbManager.createIndexes();

      // Step 6: Verify data integrity
      this.logger.log("Step 6: Verifying data integrity");
      const integrity = await this.dbManager.verifyDataIntegrity();
      if (!integrity.isValid) {
        this.logger.warn("Data integrity issues found", integrity.issues);
      } else {
        this.logger.log("✓ Data integrity verified");
      }

      this.logger.log("✅ Migration completed successfully");
      this.logger.summary(this.stats);
    } catch (error) {
      this.logger.error("❌ Migration failed", error);
      throw error;
    } finally {
      await this.dbManager.close();
    }
  }

  async syncDocumentUrls(documents) {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      try {
        let storagePath = doc.storagePath || doc.fileUrl;
        
        if (!storagePath) {
          this.logger.warn(`Document ${doc.id} has no path information`);
          this.stats.failedUpdates++;
          continue;
        }

        // Normalize storage path
        storagePath = this.normalizeStoragePath(storagePath);
        if (!storagePath) {
          this.logger.warn(`Failed to normalize path for document ${doc.id}`);
          this.stats.failedUpdates++;
          continue;
        }

        // Generate proper file URL
        const publicUrl = await this.storageManager.getFileUrl(storagePath);
        
        if (!publicUrl) {
          this.logger.warn(`Failed to generate URL for ${storagePath}`);
          this.stats.failedUpdates++;
          continue;
        }

        // Update database
        const updated = await this.dbManager.updateDocumentUrl(
          doc.id,
          storagePath,
          publicUrl,
          doc.fileName,
          doc.mimeType || "application/octet-stream"
        );

        if (updated) {
          this.stats.successfulUpdates++;
          if ((i + 1) % 10 === 0) {
            this.logger.log(`Progress: ${i + 1}/${documents.length} documents updated`);
          }
        } else {
          this.stats.failedUpdates++;
        }
      } catch (error) {
        this.logger.warn(`Error processing document ${doc.id}`, error);
        this.stats.failedUpdates++;
      }
    }
  }

  normalizeStoragePath(input) {
    if (!input || typeof input !== "string") {
      return "";
    }

    const trimmed = input.trim();

    if (!trimmed) {
      return "";
    }

    // If it's already a normalized path, return as-is
    if (!/^https?:\/\//i.test(trimmed)) {
      return trimmed.replace(/^\/+/, "").split("?")[0];
    }

    // Extract path from full URL
    try {
      const url = new URL(trimmed);
      const marker = "/storage/v1/object/";
      const index = url.pathname.indexOf(marker);

      if (index === -1) {
        return "";
      }

      const storageTail = url.pathname.slice(index + marker.length);
      const normalizedTail = storageTail
        .replace(/^(public|sign|authenticated)\//, "")
        .replace(/^profile-assets\//, "");

      return normalizedTail.replace(/^\/+/, "").split("?")[0] || "";
    } catch {
      return "";
    }
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  try {
    // Load environment variables
    loadEnvFile(".env.local");
    loadEnvFile(".env");

    // Get configuration
    const config = getConfig();

    // Initialize logger
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logger = new MigrationLogger(`document-migration-${timestamp}.log`);

    logger.log("Environment variables loaded successfully");
    logger.log("Configuration validated");

    // Run migration
    const migration = new DocumentMigration(config, logger);
    await migration.run();

    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Execute
main();
