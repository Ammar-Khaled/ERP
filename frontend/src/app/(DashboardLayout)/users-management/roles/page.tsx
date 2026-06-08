import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import RolesComponent from "./RolesComponent";

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
      <RolesComponent />
    </>
  );
};

export default page;
