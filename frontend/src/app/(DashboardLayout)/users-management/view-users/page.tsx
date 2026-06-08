import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewUsers from "./ViewUsers";

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
      <ViewUsers />
    </>
  );
};

export default page;
