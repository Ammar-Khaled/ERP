import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ReturnsPurchases from "./ReturnsPurchases";

const BCrumb = [
  {
    to: "/",
    title: "Purchases",
  },
  {
    title: "Return Purchases",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Return Purchases" items={BCrumb} />
      <ReturnsPurchases />
    </>
  );
};

export default page;
