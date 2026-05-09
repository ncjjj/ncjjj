import UserDocumentsViewer from "../../../../../components/admin/UserDocumentsViewer";

type Props = { params: { userId: string } };

export default function Page({ params }: Props) {
  const { userId } = params;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-[#111827]">User Documents</h1>
      <p className="text-sm text-[#6b7280]">Loading documents for user {userId}</p>
      <div className="mt-6">
        {/* Client component handles fetching and paging */}
        <UserDocumentsViewer userId={userId} />
      </div>
    </div>
  );
}
