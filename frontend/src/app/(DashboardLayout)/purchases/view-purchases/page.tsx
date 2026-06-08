import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewPurchases from "./ViewPurchases";

const BCrumb = [
  {
    to: "/",
    title: "Purchases",
  },
  {
    title: "View Purchases",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="View Purchases" items={BCrumb} />
      <ViewPurchases />
    </>
  );
};

export default page;
