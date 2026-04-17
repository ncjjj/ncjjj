"use client";

import { motion } from "framer-motion";
import GSTServices from "../../components/services/GSTServices";
import ITRServices from "../../components/services/ITRServices";
import Accounting from "../../components/services/Accounting";
import BusinessSetup from "../../components/services/BusinessSetup";
import LegalCompliance from "../../components/services/LegalServices";

export default function ServicesPage() {
  return (
    <main>
      <GSTServices />
      <ITRServices />
      <Accounting/>
      <BusinessSetup />
        <LegalCompliance />
    </main>
  );
}