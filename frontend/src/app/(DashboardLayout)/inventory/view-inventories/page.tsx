import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewInventory from "./ViewInventory";

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
      <ViewInventory />
    </>
  );
};

export default page;
