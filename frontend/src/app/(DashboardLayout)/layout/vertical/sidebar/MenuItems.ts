import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
import {
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconGitMerge,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconBox,
  IconShoppingCart,
  IconAperture,
  IconLayout,
  IconSettings,
  IconHelp,
  IconZoomCode,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconBorderStyle2,
  IconAppWindow,
  IconUsers,
  IconServicemark,
  IconUserBolt,
  IconBrandProducthunt,
} from "@tabler/icons-react";
import { Icon } from "@mui/material";
import { IconHotelService } from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    id: uniqueId(),
    title: "Home",
    icon: IconAperture,
    href: "/",
    chipColor: "secondary",
  },
  {
    id: uniqueId(),
    title: "Inventory",
    icon: IconBoxMultiple,
    href: "/inventory",
    children: [
      {
        id: uniqueId(),
        title: "View Inventories",
        icon: IconPoint,
        href: "/inventory/view-inventories",
      },
      // {
      //   id: uniqueId(),
      //   title: "Transfer Products",
      //   icon: IconPoint,
      //   href: "/inventory/transfer-products",
      // },
    ],
  },
  {
    id: uniqueId(),
    title: "Product",
    icon: IconBrandProducthunt,
    href: "/product",
    children: [
      {
        id: uniqueId(),
        title: "View Products",
        icon: IconPoint,
        href: "/product/view-products",
      },
      // {
      //   id: uniqueId(),
      //   title: "Returns Products",
      //   icon: IconPoint,
      //   href: "/product/returns-products",
      // },
      {
        id: uniqueId(),
        title: "Product Units",
        icon: IconPoint,
        href: "/product/product-units",
      },
      {
        id: uniqueId(),
        title: "Damaged Products",
        icon: IconPoint,
        href: "/product/damaged-products",
      },
      {
        id: uniqueId(),
        title: "Categories",
        icon: IconPoint,
        href: "/product/category",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Sales",
    icon: IconShoppingCart,
    href: "/sales",
    children: [
      {
        id: uniqueId(),
        title: "View Sales",
        icon: IconPoint,
        href: "/sales/view-sales",
      },
      {
        id: uniqueId(),
        title: "Returns Orders",
        icon: IconPoint,
        href: "/sales/returns-orders",
      },
      {
        id: uniqueId(),
        title: "point of Sale",
        icon: IconPoint,
        href: "/sales/pos",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Purchases",
    icon: IconShoppingCart,
    href: "/purchases",
    children: [
      {
        id: uniqueId(),
        title: "View Purchases",
        icon: IconPoint,
        href: "/purchases/view-purchases",
      },
      {
        id: uniqueId(),
        title: "Returns Purchases",
        icon: IconPoint,
        href: "/purchases/returns-purchases",
      },
      {
        id: uniqueId(),
        title: "Invoice Scanner",
        icon: IconPoint,
        href: "/utilities/ocr",
      },
    ],
  },
  // {
  //   id: uniqueId(),
  //   title: "Reports",
  //   icon: IconChartLine,
  //   href: "/reports",
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: "main page reports",
  //       icon: IconPoint,
  //       href: "/reports/main-reports",
  //     },
  //   ],
  // },
  {
    id: uniqueId(),
    title: "Users Management",
    icon: IconUsers,
    href: "/users-management",
    children: [
      {
        id: uniqueId(),
        title: "View Users",
        icon: IconPoint,
        href: "/users-management/view-users",
      },
      {
        id: uniqueId(),
        title: "Roles",
        icon: IconPoint,
        href: "/users-management/roles",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Client & Supplier",
    icon: IconUserBolt,
    href: "/client-supplier",
    children: [
      {
        id: uniqueId(),
        title: "View Supplier",
        icon: IconPoint,
        href: "/client-supplier/view-supplier",
      },
      {
        id: uniqueId(),
        title: "View Client",
        icon: IconPoint,
        href: "/client-supplier/view-client",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Services",
    icon: IconHotelService,
    href: "/services",
    children: [
      {
        id: uniqueId(),
        title: "Logs",
        icon: IconPoint,
        href: "/services/logs",
      },
      {
        id: uniqueId(),
        title: "Offers & Discounts",
        icon: IconPoint,
        href: "/services/offers-discounts",
      },
      // {
      //   id: uniqueId(),
      //   title: "Invoice Template",
      //   icon: IconPoint,
      //   href: "/services/invoice-template",
      // },
    ],
  },
  {
    id: uniqueId(),
    title: "AI Chat",
    icon: IconMessage2,
    href: "/ai-chat",
  },
  // {
  //   id: uniqueId(),
  //   title: "Settings",
  //   icon: IconSettings,
  //   href: "/settings",
  //   children: [
  //     {
  //       id: uniqueId(),
  //       title: "settings",
  //       icon: IconPoint,
  //       href: "/settings/settings",
  //     },
  //   ],
  // },
];

export default Menuitems;
