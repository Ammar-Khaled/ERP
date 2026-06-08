import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import DamagedProducts from "./DamagedProducts";

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
      <DamagedProducts />
    </>
  );
};

export default page;
