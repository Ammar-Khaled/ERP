import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewProducts from "./ViewProducts";

const BCrumb = [
  {
    to: "/",
    title: "Products",
  },
  {
    title: "View Products",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Products" items={BCrumb} />
      <ViewProducts />
    </>
  );
};

export default page;
