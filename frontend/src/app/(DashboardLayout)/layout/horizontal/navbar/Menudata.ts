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
        title: "main page inventory",
        icon: IconPoint,
        href: "/inventory/view-inventories",
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
    title: "Purchases",
    icon: IconShoppingCart,
    href: "/purchases",
    children: [
      {
        id: uniqueId(),
        title: "main page purchases",
        icon: IconPoint,
        href: "/purchases/main-purchases",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/users",
    children: [
      {
        id: uniqueId(),
        title: "main page users",
        icon: IconPoint,
        href: "/users/main-users",
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
        title: "main page services",
        icon: IconPoint,
        href: "/services/main-services",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Client",
    icon: IconUserCircle,
    href: "/client",
    children: [
      {
        id: uniqueId(),
        title: "main page client",
        icon: IconPoint,
        href: "/client/main-client",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Supplier",
    icon: IconUserBolt,
    href: "/supplier",
    children: [
      {
        id: uniqueId(),
        title: "main page supplier",
        icon: IconPoint,
        href: "/supplier/main-supplier",
      },
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
        title: "main page product",
        icon: IconPoint,
        href: "/product/main-product",
      },
    ],
  },
];
export default Menuitems;
