import Breadcrumb from "../../layout/shared/breadcrumb/Breadcrumb";
import ViewClient from "./ViewClient";

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
      <ViewClient />
    </>
  );
};

export default page;
