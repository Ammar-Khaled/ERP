import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import CategoriesPage from "./CategoryTable";

const BCrumb = [
  {
    to: "/",
    title: "Product",
  },
  {
    title: "Categories",
  },
];

const page = () => {
  return (
    <>
      <Breadcrumb title="Categories" items={BCrumb} />
      <CategoriesPage />
    </>
  );
};

export default page;
