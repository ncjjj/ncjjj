import type { GetServerSideProps } from "next";


export default function DashboardPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/dashboard/consultations",
      permanent: false,
    },
  };
};