import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ReturnsOrders from "./ReturnsOrders";

const BCrumb = [
  {
    to: "/",
    title: "Sales",
  },
  {
    title: "Return Sales",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Return Sales" items={BCrumb} />
      <ReturnsOrders />
    </>
  );
};

export default page;
