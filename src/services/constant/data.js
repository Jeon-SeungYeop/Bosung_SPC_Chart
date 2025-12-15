
// 그룹 별 매뉴 리스트 DB 조회 로직 적용 
// login-form.jsx 의 handleLoginSuccess() 에서 매뉴 리스트 가져와 세팅. 

// !!!!!!!    "@/components/autocomponent/common/_data"; 로 옮김 .   !!!!!!!!!!!!!!! 
//export let menuItems = [
  // {
  //   isHeadr: true,
  //   title: "menu",
  // },

  // // 여기부터 커스텀메뉴
  // {
  //   isHeadr: true,
  //   title: "customs",
  // },

  // {
  //   title: "DashBoard",
  //   isHide: true,
  //   icon: "heroicons-outline:presentation-chart-bar",
  //   link: "#",
  //   child: [
  //     {

  //       childtitle: "종합현황",
  //       childlink: "Dashboard2", 
  //     }, 
  //   ],
  // },

  // {
  //   title: "기준정보",
  //   icon: "heroicons-outline:information-circle",
  //   link: "#",
  //   isHide: true,
  //   child: [
  //     {
  //       childtitle: "공통코드 그룹 등록",
  //       childlink: "CommonCodeGroup",
  //     },
  //     {
  //       childtitle: "공통코드 그룹 별 상세 등록",
  //       childlink: "CommonCodeGroupPerDesc",
  //     },
  //     {
  //       childtitle: "공정 마스터",
  //       childlink: "ProcessMaster",
  //     },
  //     {
  //       childtitle: "설비 마스터",
  //       childlink: "EquipmentMaster",
  //     },
  //     {
  //       childtitle: "공정 별 설비 마스터",
  //       childlink: "ProcessPerEquipment",
  //     },
  //     {
  //       childtitle: "계측기기 마스터",
  //       childlink: "InstrumentMaster",
  //     },
  //     {
  //       childtitle: "작업자 마스터",
  //       childlink: "WorkerMaster",
  //     },
  //   ],
  // },
  // {
  //   title: "실시간 현황",
  //   icon: "heroicons-outline:bolt",
  //   link: "#",
  //   isHide: true,
  //   child: [
  //     {
  //       childtitle: "전력 부하 트랜드 예측",
  //       childlink: "power-predict",
  //     },
  //     {
  //       childtitle: "전력 현황",
  //       childlink: "power-state",
  //     },
  //     {
  //       childtitle: "트랜드",
  //       childlink: "trend",
  //     },
  //     {
  //       childtitle: "상별 부하율",
  //       childlink: "load-ratio",
  //     },
  //     {
  //       childtitle: "모니터링 현황",
  //       childlink: "monitoring",
  //     },
  //     {
  //       childtitle: "제품 모니터링 현황",
  //       childlink: "product_monitor",
  //     },
  //     {
  //       childtitle: "공장 모니터링 현황",
  //       childlink: "factory_state",
  //     },
  //     {
  //       childtitle: "공정능력 분석 CPK",
  //       childlink: "cpk",
  //     },
  //     {
  //       childtitle: "실시간 설비 상태 현황",
  //       childlink: "facility_status",
  //     },
  //     {
  //       childtitle: "브러쉬 예제",
  //       childlink: "BrushChartEx",
  //     },
  //   ],
  // },
  // {
  //   title: "이력관리",
  //   icon: "heroicons-outline:list-bullet",
  //   link: "#",
  //   isHide: true,
  //   child: [
  //     {
  //       childtitle: "계측기기 이력관리",
  //       childlink: "instrumenthistory",
  //     },
  //   ],
  // },
  // {
  //   title: "시스템 관리",
  //   icon: "heroicons-outline:cog",
  //   link: "#",
  //   isHide: true,
  //   child: [
  //     {
  //       childtitle: "사용자 관리",
  //       childlink: "user-manage",
  //     },
  //     {
  //       childtitle: "메뉴 관리",
  //       childlink: "ProgramMenuManage",
  //     },
  //     {
  //       childtitle: "시스템 메시지 관리",
  //       childlink: "message-manage",
  //     },
  //     {
  //       childtitle: "사용자 그룹 별 메뉴 관리",
  //       childlink: "UserGroupPerMenuList",
  //     },
  //     {
  //       childtitle: "OPC 마스터",
  //       childlink: "OPCMaster",
  //     },
  //     {
  //       childtitle: "사용자 접속 이력 관리",
  //       childlink: "UserConnectionHistory",
  //     },
  //   ],
  // },
// ];

import User1 from "@/components/assets/images/all-img/user.png";
import User2 from "@/components/assets/images/all-img/user2.png";
import User3 from "@/components/assets/images/all-img/user3.png";
import User4 from "@/components/assets/images/all-img/user4.png";
export const notifications = [
  {
    title: "Your order is placed",
    desc: "Amet minim mollit non deser unt ullamco est sit aliqua.",

    image: User1,
    link: "#",
  },
  {
    title: "Congratulations Darlene  🎉",
    desc: "Won the monthly best seller badge",
    unread: true,
    image: User2,
    link: "#",
  },
  {
    title: "Revised Order 👋",
    desc: "Won the monthly best seller badge",

    image: User3,
    link: "#",
  },
  {
    title: "Brooklyn Simmons",
    desc: "Added you to Top Secret Project group...",

    image: User4,
    link: "#",
  },
];

export const message = [
  {
    title: "Wade Warren",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: true,
    notification_count: 1,
    image: User1,
    link: "#",
  },
  {
    title: "Savannah Nguyen",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: false,
    image: User2,
    link: "#",
  },
  {
    title: "Ralph Edwards",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: true,
    notification_count: 8,
    image: User3,
    link: "#",
  },
  {
    title: "Cody Fisher",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: false,
    image: User4,
    link: "#",
  },
  {
    title: "Savannah Nguyen",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: false,
    image: User2,
    link: "#",
  },
  {
    title: "Ralph Edwards",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: true,
    notification_count: 8,
    image: User3,
    link: "#",
  },
  {
    title: "Cody Fisher",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: false,
    image: User4,
    link: "#",
  },
];

export const colors = {
  primary: "#1342ffff",
  secondary: "#717274ff",
  danger: "#fa161aff",
  black: "#111112",
  warning: "#FA916B",
  info: "#0CE7FA",
  light: "#425466",
  success: "#00ff91ff",
  "gray-f7": "#F7F8FC",
  dark: "#1E293B",
  "dark-gray": "#0F172A",
  gray: "#68768A",
  gray2: "#EEF1F9",
  "dark-light": "#CBD5E1",
  red: "#FF0000",
  sky: "#00bae2",
};

export const hexToRGB = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

export const topFilterLists = [
  {
    name: "Inbox",
    value: "all",
    icon: "uil:image-v",
  },
  {
    name: "Starred",
    value: "fav",
    icon: "heroicons:star",
  },
  {
    name: "Sent",
    value: "sent",
    icon: "heroicons-outline:paper-airplane",
  },

  {
    name: "Drafts",
    value: "drafts",
    icon: "heroicons-outline:pencil-alt",
  },
  {
    name: "Spam",
    value: "spam",
    icon: "heroicons:information-circle",
  },
  {
    name: "Trash",
    value: "trash",
    icon: "heroicons:trash",
  },
];

export const bottomFilterLists = [
  {
    name: "personal",
    value: "personal",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Social",
    value: "social",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Promotions",
    value: "promotions",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Business",
    value: "business",
    icon: "heroicons:chevron-double-right",
  },
];

import meetsImage1 from "@/components/assets/images/svg/sk.svg";
import meetsImage2 from "@/components/assets/images/svg/path.svg";
import meetsImage3 from "@/components/assets/images/svg/dc.svg";
import meetsImage4 from "@/components/assets/images/svg/sk.svg";

export const meets = [
  {
    img: meetsImage1,
    title: "Meeting with client",
    date: "01 Nov 2021",
    meet: "Zoom meeting",
  },
  {
    img: meetsImage2,
    title: "Design meeting (team)",
    date: "01 Nov 2021",
    meet: "Skyp meeting",
  },
  {
    img: meetsImage3,
    title: "Background research",
    date: "01 Nov 2021",
    meet: "Google meeting",
  },
  {
    img: meetsImage4,
    title: "Meeting with client",
    date: "01 Nov 2021",
    meet: "Zoom meeting",
  },
];
import file1Img from "@/components/assets/images/icon/file-1.svg";
import file2Img from "@/components/assets/images/icon/pdf-1.svg";
import file3Img from "@/components/assets/images/icon/zip-1.svg";
import file4Img from "@/components/assets/images/icon/pdf-2.svg";
import file5Img from "@/components/assets/images/icon/scr-1.svg";

export const files = [
  {
    img: file1Img,
    title: "Dashboard.fig",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file2Img,
    title: "Ecommerce.pdf",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file3Img,
    title: "Job portal_app.zip",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file4Img,
    title: "Ecommerce.pdf",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file5Img,
    title: "Screenshot.jpg",
    date: "06 June 2021 / 155MB",
  },
];

// ecommarce data

import blackJumper from "@/components/assets/images/e-commerce/product-card/classical-black-tshirt.png";
import blackTshirt from "@/components/assets/images/e-commerce/product-card/black-t-shirt.png";
import checkShirt from "@/components/assets/images/e-commerce/product-card/check-shirt.png";
import grayJumper from "@/components/assets/images/e-commerce/product-card/gray-jumper.png";
import grayTshirt from "@/components/assets/images/e-commerce/product-card/gray-t-shirt.png";
import pinkBlazer from "@/components/assets/images/e-commerce/product-card/pink-blazer.png";
import redTshirt from "@/components/assets/images/e-commerce/product-card/red-t-shirt.png";
import yellowFrok from "@/components/assets/images/e-commerce/product-card/yellow-frok.png";
import yellowJumper from "@/components/assets/images/e-commerce/product-card/yellow-jumper.png";

export const products = [
  {
    img: blackJumper,
    category: "men",
    name: "Classical Black T-Shirt Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt.",
    rating: "4.8",
    price: 489,
    oldPrice: "$700",
    percent: "40%",
    brand: "apple",
  },
  {
    img: blackTshirt,
    category: "men",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 20,
    oldPrice: "$700",
    percent: "40%",
    brand: "apex",
  },
  {
    img: checkShirt,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 120,
    oldPrice: "$700",
    percent: "40%",
    brand: "easy",
  },
  {
    img: grayJumper,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 70,
    oldPrice: "$700",
    percent: "40%",
    brand: "pixel",
  },
  {
    img: grayTshirt,
    category: "baby",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 30,
    oldPrice: "$700",
    percent: "40%",
    brand: "apex",
  },
  {
    img: pinkBlazer,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 40,
    oldPrice: "$700",
    percent: "40%",
    brand: "apple",
  },
  {
    img: redTshirt,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 90,
    oldPrice: "$700",
    percent: "40%",
    brand: "easy",
  },
  {
    img: yellowFrok,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 80,
    oldPrice: "$700",
    percent: "40%",
    brand: "pixel",
  },
  {
    img: yellowJumper,
    category: "furniture",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 20,
    oldPrice: "$700",
    percent: "40%",
    brand: "samsung",
  },
];

export const categories = [
  { label: "All", value: "all", count: "9724" },
  { label: "Men", value: "men", count: "1312" },
  { label: "Women", value: "women", count: "3752" },
  { label: "Child", value: "child", count: "985" },
  { label: "Baby", value: "baby", count: "745" },
  { label: "Footwear", value: "footwear", count: "1280" },
  { label: "Furniture", value: "furniture", count: "820" },
  { label: "Mobile", value: "mobile", count: "2460" },
];

export const brands = [
  { label: "Apple", value: "apple", count: "9724" },
  { label: "Apex", value: "apex", count: "1312" },
  { label: "Easy", value: "easy", count: "3752" },
  { label: "Pixel", value: "pixel", count: "985" },
  { label: "Samsung", value: "samsung", count: "2460" },
];

export const price = [
  {
    label: "$0 - $199",
    value: {
      min: 0,
      max: 199,
    },
    count: "9724",
  },
  {
    label: "$200 - $449",
    value: {
      min: 200,
      max: 499,
    },
    count: "1312",
  },
  {
    label: "$450 - $599",
    value: {
      min: 450,
      max: 599,
    },
    count: "3752",
  },
  {
    label: "$600 - $799",
    value: {
      min: 600,
      max: 799,
    },
    count: "985",
  },
  {
    label: "$800 & Above",
    value: {
      min: 800,
      max: 1000,
    },
    count: "745",
  },
];

// export const ratings = [
//   { name: 5, value: 5, count: "9724" },
//   { name: 4, value: 4, count: "1312" },
//   { name: 3, value: 3, count: "3752" },
//   { name: 2, value: 2, count: "985" },
//   { name: 1, value: 1, count: "2460" },
// ];

// export const selectOptions = [
//   {
//     value: "option1",
//     label: "Option 1",
//   },
//   {
//     value: "option2",
//     label: "Option 2",
//   },
//   {
//     value: "option3",
//     label: "Option 3",
//   },
// ];
// export const selectCategory = [
//   {
//     value: "option1",
//     label: "Top Rated",
//   },
//   {
//     value: "option2",
//     label: "Option 2",
//   },
//   {
//     value: "option3",
//     label: "Option 3",
//   },
// ];

import bkash from "@/components/assets/images/e-commerce/cart-icon/bkash.png";
import fatoorah from "@/components/assets/images/e-commerce/cart-icon/fatoorah.png";
import instamojo from "@/components/assets/images/e-commerce/cart-icon/instamojo.png";
import iyzco from "@/components/assets/images/e-commerce/cart-icon/iyzco.png";
import nagad from "@/components/assets/images/e-commerce/cart-icon/nagad.png";
import ngenious from "@/components/assets/images/e-commerce/cart-icon/ngenious.png";
import payfast from "@/components/assets/images/e-commerce/cart-icon/payfast.png";
import payku from "@/components/assets/images/e-commerce/cart-icon/payku.png";
import paypal from "@/components/assets/images/e-commerce/cart-icon/paypal.png";
import paytm from "@/components/assets/images/e-commerce/cart-icon/paytm.png";
import razorpay from "@/components/assets/images/e-commerce/cart-icon/razorpay.png";
import ssl from "@/components/assets/images/e-commerce/cart-icon/ssl.png";
import stripe from "@/components/assets/images/e-commerce/cart-icon/stripe.png";
import truck from "@/components/assets/images/e-commerce/cart-icon/truck.png";
import vougepay from "@/components/assets/images/e-commerce/cart-icon/vougepay.png";

export const payments = [
  {
    img: bkash,
    value: "bkash",
  },
  {
    img: fatoorah,
    value: "fatoorah",
  },
  {
    img: instamojo,
    value: "instamojo",
  },
  {
    img: iyzco,
    value: "iyzco",
  },
  {
    img: nagad,
    value: "nagad",
  },
  {
    img: ngenious,
    value: "ngenious",
  },

  {
    img: payfast,
    value: "payfast",
  },
  {
    img: payku,
    value: "payku",
  },
  {
    img: paypal,
    value: "paypal",
  },
  {
    img: paytm,
    value: "paytm",
  },
  {
    img: razorpay,
    value: "razorpay",
  },
  {
    img: ssl,
    value: "ssl",
  },
  {
    img: stripe,
    value: "stripe",
  },
  {
    img: truck,
    value: "truck",
  },
  {
    img: vougepay,
    value: "vougepay",
  },
];

// Radar 차트
export const Radar_data = [
  {
    s_value: 70,     // 백분율 계산
    label: "Temperature",
    value: 32
  },
  {
    s_value: 50,
    label: "Humidity",
    value: 62
  },
  {
    s_value: 10,
    label: "Frequency",
    value: 10
  }
]

// Mixed 차트
export const Mix_data = {
  label: "dashboard",
  labels: [
    "01/01/2003",
    "02/01/2003",
    "03/01/2003",
    "04/01/2003",
    "05/01/2003",
    "06/01/2003",
    "07/01/2003",
    "08/01/2003",
    "09/01/2003",
    "10/01/2003",
    "11/01/2003",],
  datas: [
    {
      name: "Temperature",
      type: "line",    // 막대 : column    선 : line     영역 : area
      data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
    },
    {
      name: "Humidity",
      type: "line",
      data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
    },
    {
      name: "Load(kW)",
      type: "line",
      data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
    },
  ]
}

export const load_ratio_mix = {
  label: "load-ratio",
  labels: [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ],
  datas: [
    {
      name: "사용 전력량[kWh]",
      type: "column",    // 막대 : column    선 : line     영역 : area
      data: [8, 9, 7, 18, 21, 22, 23, 26, 25, 23, 0, 0, 0]
    },
    {
      name: "Max[kW]",
      type: "column",
      data: [10, 11, 9, 20, 23, 24, 25, 28, 27, 25, 0, 0, 0]
    },
    {
      name: "Min[kW]",
      type: "column",
      data: [5, 6, 4, 15, 18, 19, 20, 23, 22, 20, 0, 0, 0]
    },
    {
      name: "Average[kW]",
      type: "line",
      data: [7, 8, 7, 10, 17, 19, 23, 25, 26, 16, 0, 0, 0]
    },
  ]
}

// Line 차트
export const Line_data = {
  label: "power-predict",
  labels: [
    "0:00","0:15","0:30","0:45","1:00","1:15","1:30","1:45",
    "2:00","2:15","2:30","2:45","3:00","3:15","3:30","3:45",
    "4:00","4:15","4:30","4:45","5:00","5:15","5:30","5:45",
    "6:00","6:15","6:30","6:45","7:00","7:15","7:30","7:45",
    "8:00","8:15","8:30","8:45","9:00","9:15","9:30","9:45",
    "10:00","10:15","10:30","10:45","11:00","11:15","11:30","11:45",
    "12:00","12:15","12:30","12:45","13:00","13:15","13:30","13:45",
    "14:00","14:15","14:30","14:45","15:00","15:15","15:30","15:45",
    "16:00","16:15","16:30","16:45","17:00","17:15","17:30","17:45",
    "18:00","18:15","18:30","18:45","19:00","19:15","19:30","19:45",
    "20:00","20:15","20:30","20:45","21:00","21:15","21:30","21:45",
    "22:00","22:15","22:30","22:45","23:00","23:15","23:30","23:45"
  ],
  datasets: [
    {
      label: "공급능력(MW)",
      data: Array.from({ length: 96 },
        () => Math.round(230 + (Math.random() - 0.5) * 10)
      )
    },
    {
      label: "현재부하(MW)",
      data: Array.from({ length: 96 },
        () => Math.round(210 + (Math.random() - 0.5) * 10)
      )
    },
    {
      label: "최대 예측부하(MW)",
      data: Array.from({ length: 96 },
        () => Math.round(135 + (Math.random() - 0.5) * 10)
      )
    },
    {
      label: "전력 예비율(X10^-3)",
      data: Array.from({ length: 96 },
        () => Math.round(150 + (Math.random() - 0.5) * 10)
      )
    }
  ]
};


// ReLine 차트
export const ReLine_data_Dash = {
  label: "dashboard", // 호출된 페이지명
  data: [
    {
      time: "7/12",
      Max: 280,
      Min: 260,
      Pred: 200
    },
    {
      time: "8/12",
      Max: 210,
      Min: 190,
      Pred: 180
    },
    {
      time: "9/12",
      Max: 220,
      Min: 200,
      Pred: 160
    },
    {
      time: "10/12",
      Max: 180,
      Min: 160,
      Pred: 180
    },
    {
      time: "11/12",
      Max: 270,
      Min: 250,
      Pred: 160
    },
    {
      time: "12/12",
      Max: 250,
      Min: 230,
      Pred: 200
    },
  ]
}

export const ReLine_data_Power = {
  label: "power-state", // 호출된 페이지명
  data: [
    {
      time: "7/12",
      R: 280,
      S: 260,
      T: 200
    },
    {
      time: "8/12",
      R: 210,
      S: 190,
      T: 180
    },
    {
      time: "9/12",
      R: 220,
      S: 200,
      T: 160
    },
    {
      time: "10/12",
      R: 180,
      S: 160,
      T: 180
    },
    {
      time: "11/12",
      R: 270,
      S: 250,
      T: 160
    },
    {
      time: "12/12",
      R: 250,
      S: 230,
      T: 200
    },
  ]
}
export const ReLine_data_Power_2 = {
  label: "power-state-2", // 호출된 페이지명
  data: [
    {
      time: "7/12",
      R: 380,
      S: 360,
      T: 300
    },
    {
      time: "8/12",
      R: 310,
      S: 390,
      T: 380
    },
    {
      time: "9/12",
      R: 320,
      S: 300,
      T: 360
    },
    {
      time: "10/12",
      R: 380,
      S: 360,
      T: 380
    },
    {
      time: "11/12",
      R: 370,
      S: 350,
      T: 360
    },
    {
      time: "12/12",
      R: 350,
      S: 330,
      T: 300
    },
  ]
}

export const trend_1 = {
  label: "trend-1", // 호출된 페이지명
  data: [
    {
      time: "1/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.0
    },
    {
      time: "2/12",
      실효: 0.26,
      무상: 0.7,
      피상: 1.3
    },
    {
      time: "3/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.3
    },
    {
      time: "4/12",
      실효: 0.25,
      무상: 0.5,
      피상: 1.1
    },
    {
      time: "5/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "6/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "7/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "8/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "9/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "10/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
    {
      time: "11/12",
      실효: 0.7,
      무상: 1.3,
      피상: 1.6
    },
    {
      time: "12/12",
      실효: 0.25,
      무상: 0.6,
      피상: 1.1
    },
  ]
}

export const trend_2 = {
  label: "trend-2", // 호출된 페이지명
  data: [
    {
      time: "1/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "2/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "3/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "4/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "5/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "6/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "7/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "8/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "9/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "10/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
    {
      time: "11/12",
      Avg_voltage: 0.7,
      Active_power: 1.3,
      Rctive_power: 1.6,
      Apparent_power: 1.9
    },
    {
      time: "12/12",
      Avg_voltage: 0.25,
      Active_power: 0.6,
      Rctive_power: 1.0,
      Apparent_power: 1.3
    },
  ]
}


// DonutChart2
export const load_ratio_donut = {
  label: "load-ratio",
  series: [70, 30],
  labels: ["R Ph", "T Ph"]
}


// GaugeChart
export const monitor_data = {   // 모니터링 페이지
  date: '2025-03-06',
  Average_V: 217.70,
  Average_P: 23.60,
  Sum_P: 117.2,
  load_1A: 0.60,
  load_2B: 0.40,
  load_3C: 0.93,
  power_V: 0.54,
  power_L: 0.84,
  power_S: 0.94,
  current_1A: 0.23,
  current_2B: 0.50,
  current_3C: 0.98
}
export const dashboard2_gauge_data = {
  power_V: 0.54,
  power_L: 0.84,
  power_S: 0.94,
}
// ProgrssBarChart
export const progressBar_data = {
  page: "factor",
  unit: "pf",
  value: 0.85
}
export const progressBar_data2 = {
  page: "frequency",
  unit: "Hz",
  value: 0.6002
}
export const progressBar_data3 = {
  page: "temperature",
  unit: "℃",
  value: 0.364
}
export const progressBar_data4 = {
  page: "humidity",
  unit: "%",
  value: 0.417
}


// Histogram Chart
export const histogram_data = [
  { x: 9.52, y: 6 },
  { x: 9.521, y: 5 },
  { x: 9.522, y: 3 },
  { x: 9.523, y: 4 },
  { x: 9.524, y: 1 },
  { x: 9.525, y: 2 },
  { x: 9.526, y: 0 },
  { x: 9.527, y: 5 },
  { x: 9.528, y: 6 },
  { x: 9.529, y: 3 },
  { x: 9.53, y: 7 },
  { x: 9.531, y: 6 },
  { x: 9.532, y: 5 },
  { x: 9.533, y: 4 },
  { x: 9.534, y: 5 },
  { x: 9.535, y: 6 },
  { x: 9.536, y: 3 },
  { x: 9.537, y: 2 },
  { x: 9.538, y: 1 },
  { x: 9.539, y: 5 },
  { x: 9.54, y: 4 },
  { x: 9.541, y: 4 },
  { x: 9.542, y: 5 },
  { x: 9.543, y: 3 },
  { x: 9.544, y: 5 },
  { x: 9.545, y: 6 },
  { x: 9.546, y: 5 },
  { x: 9.547, y: 3 },
  { x: 9.548, y: 2 },
  { x: 9.549, y: 6 },
  { x: 9.55, y: 5 },
  { x: 9.551, y: 6 },
  { x: 9.552, y: 8 },
  { x: 9.553, y: 7 },
  { x: 9.554, y: 6 },
  { x: 9.555, y: 4 },
  { x: 9.556, y: 7 },
  { x: 9.557, y: 6 },
  { x: 9.558, y: 2 },
  { x: 9.559, y: 9 },
  { x: 9.56, y: 3 },
  { x: 9.561, y: 6 },
  { x: 9.562, y: 8 },
  { x: 9.563, y: 9 },
  { x: 9.564, y: 11 },
  { x: 9.565, y: 8 },
  { x: 9.566, y: 7 },
  { x: 9.567, y: 6 },
  { x: 9.568, y: 9 },
  { x: 9.569, y: 12 },
  { x: 9.57, y: 15 },
  { x: 9.571, y: 14 },
  { x: 9.572, y: 16 },
  { x: 9.573, y: 11 },
  { x: 9.574, y: 8 },
  { x: 9.575, y: 12 },
  { x: 9.576, y: 10 },
  { x: 9.577, y: 6 },
  { x: 9.578, y: 8 },
  { x: 9.579, y: 13 },
  { x: 9.58, y: 14 },
  { x: 9.581, y: 14 },
  { x: 9.582, y: 13 },
  { x: 9.583, y: 13 },
  { x: 9.584, y: 12 },
  { x: 9.585, y: 12 },
  { x: 9.586, y: 11 },
  { x: 9.587, y: 11 },
  { x: 9.588, y: 10 },
  { x: 9.589, y: 9 },
  { x: 9.59, y: 8 },
  { x: 9.591, y: 7 },
  { x: 9.592, y: 8 },
  { x: 9.593, y: 6 },
  { x: 9.594, y: 5 },
  { x: 9.595, y: 3 },
  { x: 9.596, y: 1 },
  { x: 9.597, y: 4 },
  { x: 9.598, y: 0 },
  { x: 9.599, y: 1 },
  { x: 9.60, y: 10 },
  { x: 9.601, y: 7 },
  { x: 9.602, y: 8 },
  { x: 9.603, y: 6 },
  { x: 9.604, y: 5 },
  { x: 9.605, y: 3 },
  { x: 9.606, y: 1 },
  { x: 9.607, y: 4 },
  { x: 9.608, y: 1 },
  { x: 9.609, y: 1 },
  { x: 9.61, y: 3 },
  { x: 9.611, y: 1 },
  { x: 9.612, y: 1 },
  { x: 9.613, y: 1 },
  { x: 9.614, y: 1 },
  { x: 9.615, y: 1 },
  { x: 9.616, y: 1 },
  { x: 9.617, y: 1 },
  { x: 9.618, y: 1 },
  { x: 9.619, y: 1 },
  { x: 9.62, y: 2 },
]
// Histgoram Distribution Line Data
export const distri_data = {
  mean: 9.57,
  normal_stddev: 0.016,
  xrange_start: 9.52,
  xrange_end: 9.62,
  normal_maxY: 15,
  std_stddev: 0.01,
  std_maxY: 18
}
// Histogram table Data
export const table_data = {
  CPK: 0.583,
  PPK: 0.86,
  CP: 0.583,
  PP: 0.86
}

// HeatMapChart Data
export const heat_data = [
  {
    name: "1동",
    data: [
      { x: "1호기", y: 1500 },
      { x: "2호기", y: 900 },
      { x: "3호기", y: 600 },
      { x: "4호기", y: 456 },
      { x: "5호기", y: 324 },
      { x: "6호기", y: 123 },
      { x: "7호기", y: 56 },
      { x: "8호기", y: 34 },
      { x: "9호기", y: 27 },
      { x: "10호기", y: 0 },
    ],
    product: "A",
    date: "2025-06-23"
  },
  {
    name: "2동",
    data: [
      { x: "1호기", y: 900 },
      { x: "2호기", y: 1100 },
      { x: "3호기", y: 789 },
      { x: "4호기", y: 568 },
      { x: "5호기", y: 777 },
      { x: "6호기", y: 468 },
      { x: "7호기", y: 987 },
      { x: "8호기", y: 1200 },
      { x: "9호기", y: 40 },
      { x: "10호기", y: 390 },
    ],
    product: "A",
    date: "2025-06-23"
  },
  {
    name: "3동",
    data: [
      { x: "1호기", y: 666 },
      { x: "2호기", y: 777 },
      { x: "3호기", y: 999 },
      { x: "4호기", y: 333 },
      { x: "5호기", y: 222 },
      { x: "6호기", y: 111 },
      { x: "7호기", y: 888 },
      { x: "8호기", y: 444 },
      { x: "9호기", y: 555 },
      { x: "10호기", y: 90 },
    ],
    product: "A",
    date: "2025-06-24"
  },
  {
    name: "4동",
    data: [
      { x: "1호기", y: 999 },
      { x: "2호기", y: 888 },
      { x: "3호기", y: 777 },
      { x: "4호기", y: 666 },
      { x: "5호기", y: 555 },
      { x: "6호기", y: 444 },
      { x: "7호기", y: 333 },
      { x: "8호기", y: 222 },
      { x: "9호기", y: 111 },
      { x: "10호기", y: 0 },
    ],
    product: "A",
    date: "2025-06-24"
  },
  {
    name: "5동",
    data: [
      { x: "1호기", y: 1500 },
      { x: "2호기", y: 1400 },
      { x: "3호기", y: 1300 },
      { x: "4호기", y: 1300 },
      { x: "5호기", y: 1300 },
      { x: "6호기", y: 1300 },
      { x: "7호기", y: 1300 },
      { x: "8호기", y: 1300 },
      { x: "9호기", y: 1300 },
      { x: "10호기", y: 1300 },
    ],
    product: "C",
    date: "2025-06-24"
  },
]