import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewSupplier from "./ViewSupplier";

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
      <ViewSupplier />
    </>
  );
};

export default page;
