export type Section = 'ops' | 'insights' | 'admin' | 'case';
export type OpsTab = 'inbox' | 'cases' | 'work';
export type InsTab = 'kpis' | 'overview' | 'performance';
export type KpiView = 'exec' | 'score' | 'heat' | 'detail';
export type AdmTab = 'users' | 'depts' | 'cats' | 'classes' | 'templates' | 'customers' | 'profiles' | 'mailboxes';

export interface User {
  name: string;
  dept: string;
  role: string;
  init: string;
}

export interface Mailbox {
  id: string;
  name: string;
  addr: string;
  dept: string;
  active: boolean;
  def: boolean;
}

export interface Task {
  id: string;
  wi: string;
  title: string;
  dept: string;
  assignee: string | null;
  status: 'To Do' | 'In Progress' | 'Done';
  readiness: 'Ready' | 'Waiting for Task' | 'Waiting for Customer' | 'Upcoming';
  waitingFor?: string | null;
  dep?: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  due: string;
  timing: 'On Track' | 'Due Soon' | 'Overdue';
  overdueBy?: string | null;
  done?: string | null;
  milestone: boolean;
  desc?: string;
  origin?: 'rule' | 'ai' | 'manual';
  notes?: Array<{ by: string; time: string; text: string; mentions?: string[] }>;
}

export interface CaseField {
  k: string;
  v: string;
  src: string;
  rev: 'High Confidence' | 'Review Recommended' | 'Conflict Detected' | 'Missing';
  edited?: boolean;
  conf?: number;
  conflict?: { a: string; b: string };
  swedishName?: string;
  section?: string;
}

export interface CaseDataGroup {
  group: string;
  fields: CaseField[];
}

export interface CaseRecord {
  type: string;
  number: string;
  created: string;
  status: string;
  wi: string;
}

export interface CaseMessage {
  type: 'in' | 'out' | 'internal';
  from: string;
  to?: string;
  time: string;
  subject?: string;
  body: string;
  attachments?: string[];
  files?: Array<{ name: string; size: number; url?: string }>;
  nid?: string;
  mentions?: string[];
}

export interface OrderItem {
  id?: string;
  name: string;
  weight: string;
  length?: string;
  width?: string;
  height?: string;
  qty: number;
  type?: string;
  notes?: string;
  marking?: string;
  goodsType?: string;
  packageNo?: string;
  loadingMeters?: string;
  palletPlaces?: string;
  volume?: string;
  confidence?: number;
}

export interface CaseActivity {
  time: string;
  actor: string;
  kind: 'Communication' | 'System' | 'Tasks' | 'Data' | 'Orders';
  text: string;
  detail?: string;
}

export interface CaseItem {
  id: string;
  displayId?: string;
  customer: string;
  contact: string;
  email: string;
  title: string;
  categories: string[];
  caseClass: string;
  classification?: string;
  types?: string[];
  status?: string;
  weight?: string;
  items?: OrderItem[];
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  lifecycle: 'New' | 'Active' | 'Completed' | 'Cancelled';
  conditions: string[];
  created: string;
  lastActivity: string;
  origin?: 'rule' | 'ai' | 'manual';
  originNote?: string;
  scenario?: string;
  intake?: boolean;
  accepted?: boolean;
  comm: {
    state: 'No Action Required' | 'Acknowledged' | 'Response Required' | 'Waiting for Customer' | 'Update Recommended' | 'Final Update Required';
    lastIn: string | null;
    lastOut: string | null;
    waiting?: string | null;
  };
  summary: string;
  workItems: Array<{ id: string; name: string; dept: string }>;
  tasks: Task[];
  data: CaseDataGroup[];
  records: CaseRecord[];
  conversation: CaseMessage[];
  activity: CaseActivity[];
}

export interface InboxMessage {
  id: string;
  date: string;
  time: string;
  customer: string;
  sender: string;
  subject: string;
  ai: string;
  state: string;
  match: string | null;
  caseId: string | null;
  orderRef?: string;
  reason: string;
  priority: 'Urgent' | 'High' | 'Normal' | 'Low';
  mailbox: string;
  attention: boolean;
  body: string;
  extracted: string[];
  suggestion: string;
  read?: boolean;
  reply?: boolean;
  unreadReply?: boolean;
  conf?: number | null;
  icon?: string;
  intent?: [string, string];
  assignee?: string | null;
  skipReason?: string;
  applied?: boolean;
  _fields?: CaseField[];
}

export interface NotificationItem {
  id: string;
  unread: boolean;
  text: string;
  meta: string;
  go: { case?: string; tab?: string; ops?: OpsTab };
}
