import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ProductUnits from "./ProductUnits";

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
      <ProductUnits />
    </>
  );
};

export default page;
