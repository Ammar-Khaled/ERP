import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ApexRadar from "@/app/components/charts/ApexRadar";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Basic Table",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Basic Table" items={BCrumb} />
      <ApexRadar />
    </>
  );
};

export default page;
