import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewSales from "./ViewSales";

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "View Sales",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="View Sales" items={BCrumb} />
      <ViewSales />
    </>
  );
};

export default page;
