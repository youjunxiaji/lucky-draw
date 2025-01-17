import { getAvatar } from './utils';

// 奖项配置
export const prizes = [
  {
    level: 1,
    name: "一等奖",
    count: 1
  },
]

// 参与者名单
export const colleagues = [
  {
    id: 1,
    name: "慕斌",
    avatar: getAvatar('mubin'),
    department: "M中心",
    title: "董助兼M中心总监",
    prize: null, // null 表示未中奖，1 表示一等奖，2 表示二等奖
  },
  {
    id: 2,
    name: "张伟",
    avatar: getAvatar('zhangwei'),
    department: "研发七部",
    title: "部门主管",
    prize: null, // null 表示未中奖，1 表示一等奖，2 表示二等奖
  },
  {
    id: 3,
    name: "袁晨曦",
    avatar: getAvatar('yuanchenxi'),
    department: "研发七部",
    title: "产品设计工程师",
    prize: null,
  },
  {
    id: 4,
    name: "陈绍祥",
    avatar: getAvatar('chenshaoxiang'),
    department: "研发七部",
    title: "产品设计工程师",
    prize: null,
  },
  {
    id: 5,
    name: "刘恒山",
    avatar: getAvatar('liuhengshan'),
    department: "研发七部",
    title: "仿真工程师",
    prize: null,
  },
  {
    id: 6,
    name: "宋如月",
    avatar: getAvatar('songruyue'),
    department: "研发七部",
    title: "仿真工程师",
    prize: null,
  },
  {
    id: 7,
    name: "顾磊",
    avatar: getAvatar('gulei'),
    department: "研发七部",
    title: "数字工程师",
    prize: null,
  },
  {
    id: 8,
    name: "徐辉",
    avatar: getAvatar('xuhui'),
    department: "研发七部",
    title: "仿真工程师",
    prize: null,
  },
  {
    id: 9,
    name: "Bruiaka",
    avatar: getAvatar('bruiaka'),
    department: "研发七部",
    title: "全能选手",
    prize: null,
  }
] 