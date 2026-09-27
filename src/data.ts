import { CaseItem, InboxMessage, Mailbox, NotificationItem, Task, User } from './types';

export const ME = 'Malin Andersson';
export const MY_DEPT = 'Transport';

export const USERS: User[] = [
  { name: 'Daniel Frölander', dept: 'Transport', role: 'IT Lead', init: 'DF' },
  { name: 'Andreas Backström', dept: 'Transport', role: 'Transport Manager', init: 'AB' },
  { name: 'Malin Andersson', dept: 'Transport', role: 'Operations Specialist', init: 'MA' },
  { name: 'Niclause', dept: 'Transport', role: 'Reviewer', init: 'NI' },
  { name: 'Traffic Controller', dept: 'Transport', role: 'Traffic Controller', init: 'TC' },
  { name: 'Anna Svensson', dept: 'Warehouse', role: 'Warehouse Coordinator', init: 'AS' },
  { name: 'Erik Nilsson', dept: 'Packing', role: 'Packing Operator', init: 'EN' }
];

export const DEPTS = ['Transport', 'Warehouse', 'Packing', 'Freight Forwarding', 'Finance'];
export const CUSTOMERS = ['ABB Robotics Sweden AB', 'ABB Switzerland AG', 'ALSTOM Rail Sweden AB', 'ABB Oy', '247 Logistics AB', 'Essity AB', 'Peab AB', 'NCC Sverige AB', 'Boliden AB', 'Northvolt AB', 'Medetec AB', 'Oriola Sweden AB', 'Voith Hydro AB'];

export const CLASSIFICATIONS = [
  'New Transport Order',
  'Order Change',
  'Inquiry',
  'Status Inquiry',
  'Document Request'
];

export const SERVICE_TYPES = [
  'Freight Forwarding',
  'Dangerous Goods',
  'Air Freight',
  'Express',
  'Standard Transport',
  'Warehouse',
  'Packing'
];

export const MAILBOXES: Mailbox[] = [
  { id: 'MB-01', name: 'Transport Inbox', addr: 'transport@aalogistik.se', dept: 'Transport', active: true, def: true },
  { id: 'MB-02', name: 'Terminal / Warehouse', addr: 'terminal@aalogistik.se', dept: 'Warehouse', active: true, def: false }
];

export const CATEGORIES = [
  { name: 'Transport', dept: 'Transport', active: true, desc: 'Road transport bookings and changes' },
  { name: 'Warehouse', dept: 'Warehouse', active: true, desc: 'Receiving, storage and outbound handling' },
  { name: 'Packing', dept: 'Packing', active: true, desc: 'Repacking, crating and export packing' },
  { name: 'Freight Forwarding', dept: 'Freight Forwarding', active: true, desc: 'Onward national and international forwarding' },
  { name: 'Finance', dept: 'Finance', active: true, desc: 'Invoice and pricing queries' },
  { name: 'Other / Unclassified', dept: '—', active: true, desc: 'Requires human routing review' }
];

export const CASE_CLASSES = [
  { name: 'Inquiry', desc: 'Price or capability question, no booking yet', profile: 'Inquiry profile', active: true },
  { name: 'Confirmed Order', desc: 'Customer expects execution', profile: 'Transport required data', active: true },
  { name: 'Change Request', desc: 'Change to existing work', profile: 'Change profile', active: true },
  { name: 'Status Question', desc: 'Customer asks where goods are', profile: 'None', active: true },
  { name: 'Complaint / Deviation', desc: 'Damage, delay or deviation', profile: 'Deviation profile', active: true },
  { name: 'Other', desc: 'Everything else, routed manually', profile: 'None', active: true }
];

export const REQ_PROFILES = [
  { name: 'Transport required data', cls: 'Confirmed Order', fields: ['Customer', 'Pickup location', 'Delivery location', 'Items', 'Dimensions', 'Pallets'], blocks: 'Opter order creation' },
  { name: 'Inquiry profile', cls: 'Inquiry', fields: ['Customer', 'Pickup location', 'Delivery location', 'Items'], blocks: 'Quote sending' },
  { name: 'Change profile', cls: 'Change Request', fields: ['Existing case or Opter reference', 'Requested change'], blocks: 'Opter update' },
  { name: 'Deviation profile', cls: 'Complaint / Deviation', fields: ['Customer', 'Existing case or Opter reference', 'Description'], blocks: 'Nothing — informational' }
];

export const CUSTOMER_RULES = [
  { customer: 'ABB Robotics Sweden AB', domains: 'se.abb.com', prio: 'High', rules: 'PO number required on every order · Confirmation email always to adrjan.gradenas@se.abb.com' },
  { customer: 'ABB Switzerland AG', domains: 'abb.com', prio: 'Normal', rules: 'Delivery note always attached — use it to validate the delivery address' },
  { customer: 'ALSTOM Rail Sweden AB', domains: 'alstom.com, alstom-edi.com', prio: 'High', rules: 'EDI mailbox sends scanned orders · always verify manually' },
  { customer: 'ABB Oy', domains: 'se.abb.com', prio: 'Normal', rules: 'Quotes valid 14 days' }
];

export const TEMPLATES = [
  {
    id: 'TT1', cat: 'Transport', cls: 'Confirmed Order', customer: null, active: true, tasks: [
      { t: 'Validate transport details', d: 'Transport', p: 'High', due: '+2 h', ms: false, type: 'Default' },
      { t: 'Create Opter order', d: 'Transport', p: 'High', due: '+3 h', ms: false, type: 'Default' },
      { t: 'Confirm order to customer', d: 'Transport', p: 'Normal', due: '+4 h', ms: true, type: 'Default' },
      { t: 'Arrange pickup', d: 'Transport', p: 'High', due: 'Pickup − 2 h', ms: false, type: 'Default' }
    ]
  },
  {
    id: 'TT2', cat: 'Warehouse', cls: 'Confirmed Order', customer: null, active: true, tasks: [
      { t: 'Prepare receiving', d: 'Warehouse', p: 'Normal', due: 'Arrival − 4 h', ms: false, type: 'Default' },
      { t: 'Receive goods', d: 'Warehouse', p: 'High', due: 'Arrival + 30 min', ms: false, type: 'Default' },
      { t: 'Register in WMS', d: 'Warehouse', p: 'Normal', due: '+1 day', ms: false, type: 'Default' }
    ]
  },
  {
    id: 'TT3', cat: 'Packing', cls: 'Confirmed Order', customer: null, active: true, tasks: [
      { t: 'Repack to specification', d: 'Packing', p: 'Normal', due: '+1 day', ms: false, type: 'Conditional', cond: 'Repacking requested' }
    ]
  },
  {
    id: 'TT4', cat: 'Transport', cls: 'Inquiry', customer: null, active: true, tasks: [
      { t: 'Review inquiry', d: 'Transport', p: 'Normal', due: '+2 h', ms: false, type: 'Default' },
      { t: 'Obtain pricing and operational input', d: 'Transport', p: 'Normal', due: '+4 h', ms: false, type: 'Default' },
      { t: 'Prepare response', d: 'Transport', p: 'Normal', due: '+6 h', ms: false, type: 'Default' },
      { t: 'Send quote', d: 'Transport', p: 'Normal', due: '+8 h', ms: true, type: 'Default' },
      { t: 'Follow up on quote', d: 'Transport', p: 'Normal', due: '+3 days', ms: false, type: 'Default' }
    ]
  },
  {
    id: 'TT5', cat: 'Transport', cls: 'Confirmed Order', customer: 'ABB Robotics Sweden AB', active: true, tasks: [
      { t: 'Validate transport details', d: 'Transport', p: 'High', due: '+2 h', ms: false, type: 'Default' },
      { t: 'Attach PO number to Opter order', d: 'Transport', p: 'High', due: '+3 h', ms: false, type: 'Customer-specific', cond: 'ABB requires PO on every order' },
      { t: 'Create Opter order', d: 'Transport', p: 'High', due: '+3 h', ms: false, type: 'Default' },
      { t: 'Confirm order to customer', d: 'Transport', p: 'Normal', due: '+4 h', ms: true, type: 'Default' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'N1', unread: true, text: 'Daniel needs your help on 325854 — review the pickup details', meta: 'Mention · 12 min ago', go: { case: '325854', tab: 'conversation' } },
  { id: 'N2', unread: true, text: 'Task overdue: Book carrier slot — 325857', meta: 'Overdue 24 min · Transport', go: { case: '325857', tab: 'work' } },
  { id: 'N3', unread: true, text: 'Possible existing case for a new email from ABB Robotics', meta: 'Needs review · 5 min ago', go: { ops: 'inbox' } },
  { id: 'N4', unread: false, text: 'Customer replied — ABB Oy quote 325856', meta: 'Yesterday 16:52', go: { case: '325856', tab: 'conversation' } },
  { id: 'N5', unread: false, text: 'Task assigned to you: Arrange pickup in Västerås', meta: 'Today 10:30 · Transport', go: { case: '325854', tab: 'work' } }
];

export const INITIAL_CASES: CaseItem[] = [
  {
    id: '325841',
    displayId: 'AA-1042',
    customer: 'ABB AB, Machines Outbound',
    contact: 'Robert Svantesson',
    email: 'robert.svantesson@se.abb.com',
    title: 'Transport request – BALJA, AMS-1400. BREDLAST. LASTAS KL 13:00.',
    categories: ['Freight Forwarding', 'Transport'],
    caseClass: 'Confirmed Order',
    classification: 'New Transport Order',
    types: ['Freight Forwarding', 'Special Transport'],
    priority: 'Normal',
    status: 'Ready for Order',
    weight: '8 100,00 kg',
    lifecycle: 'Active',
    conditions: ['Needs Review'],
    created: '25 Sep 2024, 07:58',
    lastActivity: '10 min ago',
    origin: 'ai',
    originNote: 'Direct EDI/Opter booking from ABB Machines Outbound',
    scenario: 'Transport only',
    items: [
      {
        id: 'item-1',
        name: 'BALJA (AMS 1400) — Machines Stator Housing',
        marking: 'L009717-A8',
        goodsType: 'BALJA (AMS 1400)',
        qty: 1,
        weight: '8 100,00 kg',
        length: '4,70',
        width: '3,40',
        height: '1,50',
        volume: '23,97 m³',
        loadingMeters: '0,00',
        palletPlaces: '0,00',
        type: '—',
        packageNo: '—',
        confidence: 93,
        notes: 'BREDLAST (3,40 m width). Requires wide-load transport permit and balja carrier.'
      }
    ],
    comm: { state: 'Acknowledged', lastIn: 'Today 11:30', lastOut: 'Today 11:42', waiting: null },
    summary: 'Confirmed order from ABB AB, Machines Outbound for 8.1-ton overwidth consignment (BALJA, AMS-1400). Pickup at Machines Baksidan Port 7 strictly at 13:00, delivery to MPA Måleriproduktion AB in Västerås.',
    workItems: [{ id: 'wi1', name: 'Special Transport — Västerås', dept: 'Transport' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Verify wide load permit (BREDLAST 3,40 m)', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', priority: 'High', due: 'Today 12:00', timing: 'On Track', done: 'Today 11:40', milestone: false, desc: '3.40 m width checked against municipal transport route.' },
      { id: 'T2', wi: 'wi1', title: 'Dispatch Balja trailer to Port 7 for 13:00 slot', dept: 'Transport', assignee: 'Malin Andersson', status: 'In Progress', readiness: 'Ready', priority: 'High', due: 'Today 12:30', timing: 'On Track', done: null, milestone: false, desc: 'Loading scheduled precisely at 13:00.' },
      { id: 'T3', wi: 'wi1', title: 'Create & confirm Opter order 1000962512', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'High', due: 'Today 12:45', timing: 'On Track', done: 'Today 11:42', milestone: true, desc: 'Fraktsedelsnr 1000962512 registered.' }
    ],
    data: [
      {
        group: 'Customer / Order (Kund / Order)',
        fields: [
          { k: 'Customer Code', v: 'MACHINESOUT', src: 'Customer master', rev: 'High Confidence', swedishName: 'Kundkod', section: 'Customer / Order' },
          { k: 'Customer Name', v: 'ABB AB, Machines Outbound', src: 'Customer master', rev: 'High Confidence', swedishName: 'Kund', section: 'Customer / Order' },
          { k: 'Contact Name', v: 'Robert Svantesson', src: 'Order form', rev: 'High Confidence', swedishName: 'Beställare', section: 'Customer / Order' },
          { k: 'Project / Reference', v: '4575381675', src: 'Order form', rev: 'High Confidence', swedishName: 'Littera/Projekt', section: 'Customer / Order' },
          { k: 'Payer / Contact', v: 'Avsändare', src: 'Customer contract', rev: 'High Confidence', swedishName: 'Betalare/Telefon', section: 'Customer / Order' }
        ]
      },
      {
        group: 'Customer Information (Kundinformation)',
        fields: [
          { k: 'Customer Number', v: '99111346', src: 'Opter master', rev: 'High Confidence', swedishName: 'Kundinformation', section: 'Customer Information' },
          { k: 'PO Number', v: '4575381675', src: 'Order confirmation', rev: 'High Confidence', swedishName: 'PO-nummer', section: 'Customer Information' }
        ]
      },
      {
        group: 'Messages & Instructions (Meddelanden / Anvisningar)',
        fields: [
          { k: 'Delivery Instructions', v: 'BALJA, AMS-1400. BREDLAST. LASTAS KL 13:00.', src: 'Booking instruction', rev: 'High Confidence', swedishName: 'Leveransanvisningar', section: 'Messages' }
        ]
      },
      {
        group: 'Sender (Avsändare / Pickup)',
        fields: [
          { k: 'Sender Customer Code', v: '394MACHINESBAK', src: 'Site register', rev: 'High Confidence', swedishName: 'Kundkod/Kundnummer', section: 'Sender' },
          { k: 'Sender Name', v: 'Machines Baksidan (PORT 7)', src: 'Site register', rev: 'High Confidence', swedishName: 'Namn', section: 'Sender' },
          { k: 'Street / Number', v: 'Elmotargatan 42', src: 'Site register', rev: 'High Confidence', swedishName: 'Gata/Nr', section: 'Sender' },
          { k: 'Information', v: '—', src: 'Site register', rev: 'High Confidence', swedishName: 'Info', section: 'Sender' },
          { k: 'Postal Code / City', v: '72136 Västerås', src: 'Site register', rev: 'High Confidence', swedishName: 'Postnr/Ort', section: 'Sender' },
          { k: 'Pickup Date / Time', v: '13:00', src: 'Booking schedule', rev: 'High Confidence', swedishName: 'Tid/Datum', section: 'Sender' },
          { k: 'Geographic / Price Zone', v: 'Västerås / Västerås', src: 'Tariff engine', rev: 'High Confidence', swedishName: 'Geozon/Priszon', section: 'Sender' },
          { k: 'Country', v: 'Sweden', src: 'System', rev: 'High Confidence', swedishName: 'Land', section: 'Sender' },
          { k: 'Code / Telephone', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Kod/Tel', section: 'Sender' }
        ]
      },
      {
        group: 'Receiver (Mottagare / Delivery)',
        fields: [
          { k: 'Receiver Customer Code', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Kundkod/Kundnummer', section: 'Receiver' },
          { k: 'Receiver Name', v: 'MPA Måleriproduktion AB', src: 'Order form', rev: 'High Confidence', swedishName: 'Namn', section: 'Receiver' },
          { k: 'Street / Number', v: 'Skåp... 5', src: 'Order form', rev: 'High Confidence', swedishName: 'Gata/Nr', section: 'Receiver' },
          { k: 'Information', v: '—', src: 'Order form', rev: 'High Confidence', swedishName: 'Info', section: 'Receiver' },
          { k: 'Postal Code / City', v: '72132 Västerås', src: 'Postal directory', rev: 'High Confidence', swedishName: 'Postnr/Ort', section: 'Receiver' },
          { k: 'Delivery Date / Time', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Tid/Datum', section: 'Receiver' },
          { k: 'Geographic / Price Zone', v: 'Västerås / Västerås', src: 'Tariff engine', rev: 'High Confidence', swedishName: 'Geozon/Priszon', section: 'Receiver' },
          { k: 'Country', v: 'Sweden', src: 'System', rev: 'High Confidence', swedishName: 'Land', section: 'Receiver' },
          { k: 'Code / Telephone', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Kod/Tel', section: 'Receiver' }
        ]
      },
      {
        group: 'Order Data & Financials (Orderdata & Ekonomi)',
        fields: [
          { k: 'Freight Document No.', v: '1000962512', src: 'Opter system', rev: 'High Confidence', swedishName: 'Fraktsedelsnr', section: 'Order Data' },
          { k: 'Sender Reference', v: 'Robert Svantesson', src: 'Booking document', rev: 'High Confidence', swedishName: 'Avsändarref', section: 'Order Data' },
          { k: 'Receiver Reference', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Mottagareref', section: 'Order Data' },
          { k: 'Region', v: '[Ingen]', src: 'Opter routing', rev: 'High Confidence', swedishName: 'Region', section: 'Order Data' },
          { k: 'Invoice Marking', v: 'L009717', src: 'ABB ERP', rev: 'High Confidence', swedishName: 'Fakturamärkning', section: 'Order Data' },
          { k: 'Summary ID', v: '325841', src: 'Opter ledger', rev: 'High Confidence', swedishName: 'Summera-ID', section: 'Order Data' },
          { k: 'Estimated CO₂ Emission', v: '—', src: 'Eco module', rev: 'High Confidence', swedishName: 'Uppskattat CO2-utsläpp (g)', section: 'Order Data' },
          { k: 'Calculated CO₂ Emission', v: '0,00', src: 'Eco module', rev: 'High Confidence', swedishName: 'Beräknat CO2-utsläpp (g)', section: 'Order Data' },
          { k: 'Revenue', v: '396,28 SEK', src: 'Price sheet M-04', rev: 'High Confidence', swedishName: 'Intäkt', section: 'Order Data' },
          { k: 'Cost', v: '0,00 SEK', src: 'Own fleet execution', rev: 'High Confidence', swedishName: 'Kostnad', section: 'Order Data' },
          { k: 'Result', v: '396,28 SEK', src: 'Financial summary', rev: 'High Confidence', swedishName: 'Resultat', section: 'Order Data' },
          { k: 'VAT', v: '99,07 SEK', src: 'Tax engine (25%)', rev: 'High Confidence', swedishName: 'Moms', section: 'Order Data' }
        ]
      },
      {
        group: 'Dimensions & Capacity (Mått & Transportparametrar)',
        fields: [
          { k: 'Number of Packages', v: '1', src: 'Weighing ticket', rev: 'High Confidence', swedishName: 'Kollin', section: 'Dimensions' },
          { k: 'Total weight', v: '8 100,00 kg', src: 'Weighing bridge', rev: 'High Confidence', swedishName: 'Vikt', section: 'Dimensions' },
          { k: 'Length', v: '4,70 m', src: 'Physical manifest', rev: 'High Confidence', swedishName: 'Längd', section: 'Dimensions' },
          { k: 'Volume', v: '23,97 m³', src: 'Calculated (4.70 × 3.40 × 1.50)', rev: 'High Confidence', swedishName: 'Volym', section: 'Dimensions' },
          { k: 'Pallet Places', v: '0,00', src: 'Non-palletized', rev: 'High Confidence', swedishName: 'Pallplats', section: 'Dimensions' },
          { k: 'Loading Meters', v: '0,00', src: 'Non-standard body', rev: 'High Confidence', swedishName: 'Flakmeter', section: 'Dimensions' },
          { k: 'Units', v: '0,00', src: 'System', rev: 'High Confidence', swedishName: 'Enhet', section: 'Dimensions' },
          { k: 'Chargeable Weight', v: '8100,00', src: 'Tariff calculation', rev: 'High Confidence', swedishName: 'Prissättningsvikt', section: 'Dimensions' },
          { k: 'Distance', v: '11,665 km', src: 'Opter GPS distance engine', rev: 'High Confidence', swedishName: 'Avstånd', section: 'Dimensions' },
          { k: 'Time', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Tid', section: 'Dimensions' },
          { k: 'Driving Time', v: '0:22', src: 'Route planner', rev: 'High Confidence', swedishName: 'Körtid', section: 'Dimensions' }
        ]
      },
      {
        group: 'Goods / Colli (Gods / Kollin)',
        fields: [
          { k: 'Quantity', v: '1', src: 'Shipping note', rev: 'High Confidence', swedishName: 'Antal', section: 'Goods / Colli' },
          { k: 'Package Type', v: '—', src: 'Shipping note', rev: 'High Confidence', swedishName: 'Kollislag', section: 'Goods / Colli' },
          { k: 'Goods Marking', v: 'L009717-A8', src: 'Stencil marking', rev: 'High Confidence', swedishName: 'Godsmärkning', section: 'Goods / Colli' },
          { k: 'Goods Type', v: 'BALJA (AMS 1400)', src: 'Packing note', rev: 'High Confidence', swedishName: 'Godstyp', section: 'Goods / Colli' },
          { k: 'Weight', v: '8 100,00 kg', src: 'Crane loadcell', rev: 'High Confidence', swedishName: 'Vikt', section: 'Goods / Colli' },
          { k: 'Volume', v: '23,97 m³', src: 'Calculated volume', rev: 'High Confidence', swedishName: 'Volym', section: 'Goods / Colli' },
          { k: 'Loading Meters', v: '0,00', src: 'System', rev: 'High Confidence', swedishName: 'Flakmeter', section: 'Goods / Colli' },
          { k: 'Pallet Places', v: '0,00', src: 'System', rev: 'High Confidence', swedishName: 'Pallplats', section: 'Goods / Colli' },
          { k: 'Length', v: '4,70 m', src: 'Laser gauge', rev: 'High Confidence', swedishName: 'Längd (m)', section: 'Goods / Colli' },
          { k: 'Width', v: '3,40 m', src: 'Laser gauge', rev: 'High Confidence', swedishName: 'Bredd (m)', section: 'Goods / Colli' },
          { k: 'Height', v: '1,50 m', src: 'Laser gauge', rev: 'High Confidence', swedishName: 'Höjd (m)', section: 'Goods / Colli' },
          { k: 'Package Number', v: '—', src: 'System', rev: 'High Confidence', swedishName: 'Kollinummer', section: 'Goods / Colli' }
        ]
      }
    ],
    records: [
      { type: 'Opter order', number: '1000962512', created: '25 Sep 11:42', status: 'Planned', wi: 'Special Transport' }
    ],
    conversation: [
      {
        type: 'in',
        from: 'Robert Svantesson <robert.svantesson@se.abb.com>',
        to: 'transport@aalogistik.se',
        time: 'Today 11:30',
        subject: 'Transport order ABB Machines Outbound: BALJA (AMS-1400) BREDLAST kl 13:00',
        body: 'Hej AA Logistik,\n\nOrder for transport from Machines Baksidan (PORT 7) to MPA Måleriproduktion AB.\nInstructions: BALJA, AMS-1400. BREDLAST. LASTAS KL 13:00.\nWeight: 8100 kg. Dimensions: 4.70 x 3.40 x 1.50 m.\nPO: 4575381675 / Littera: 4575381675.\nInvoice ref: L009717.\n\nMed vänlig hälsning,\nRobert Svantesson, ABB AB, Machines Outbound',
        attachments: []
      },
      {
        type: 'out',
        from: 'transport@aalogistik.se',
        to: 'robert.svantesson@se.abb.com',
        time: 'Today 11:42',
        subject: 'Confirmed: Transport booking 1000962512 (BALJA AMS-1400)',
        body: 'Hej Robert,\n\nTransport confirmed with Opter reference 1000962512.\nWide-load trailer assigned to Port 7 for loading at 13:00.\n\nMed vänlig hälsning,\nMalin Andersson, AA Logistik',
        attachments: []
      }
    ],
    activity: [
      { time: 'Today 11:30', actor: 'System', kind: 'Communication', text: 'Order received from robert.svantesson@se.abb.com' },
      { time: 'Today 11:40', actor: 'Andreas Backström', kind: 'Tasks', text: 'Wide load permit route verified' },
      { time: 'Today 11:42', actor: 'Malin Andersson', kind: 'Orders', text: 'Opter order 1000962512 created' }
    ]
  },
  {
    id: '325860', customer: 'Northvolt AB', contact: 'Abel Amare', email: 'abel.amare@northvolt.com',
    title: 'Forwarding 8 flatpack pallets Älmhult → Stockholm',
    categories: ['Freight Forwarding', 'Transport'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Freight Forwarding'], priority: 'Normal',
    status: 'Needs Review', weight: '3 400 kg',
    lifecycle: 'Active', conditions: ['Needs Review'], created: '25 Sep 11:15', lastActivity: '20 min ago', origin: 'ai', originNote: 'AI proposal — awaiting verification',
    scenario: 'Freight Forwarding',
    items: [
      { id: 'item-1', name: 'BILLY Bookcase Flatpack Bundles', weight: '1 600 kg', length: '120 cm', width: '80 cm', height: '145 cm', qty: 4, type: 'EUR Pallet', notes: 'Double-strapped, shrinkwrapped' },
      { id: 'item-2', name: 'KALLAX Shelving Components', weight: '1 800 kg', length: '120 cm', width: '80 cm', height: '160 cm', qty: 4, type: 'EUR Pallet', notes: 'Stackable max 2 high' }
    ],
    comm: { state: 'Response Required', lastIn: 'Today 11:15', lastOut: null, waiting: '20 min' },
    summary: 'New transport order from Northvolt for onward freight forwarding of 8 pallets from Älmhult to Stockholm. Review required before booking carrier.',
    workItems: [{ id: 'wi1', name: 'Freight Forwarding — Stockholm', dept: 'Freight Forwarding' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Validate shipment specifications', dept: 'Freight Forwarding', assignee: 'Malin Andersson', status: 'To Do', readiness: 'Ready', priority: 'Normal', due: 'Today 13:00', timing: 'On Track', done: null, milestone: false, desc: 'Verify 8 EUR pallets stackability and transport weight with Northvolt.' },
      { id: 'T2', wi: 'wi1', title: 'Select linehaul carrier', dept: 'Freight Forwarding', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Validate shipment specifications', dep: 'T1', priority: 'Normal', due: 'Today 14:30', timing: 'On Track', done: null, milestone: false, desc: 'Confirm carrier slot for Älmhult pickup.' },
      { id: 'T3', wi: 'wi1', title: 'Create Opter order', dept: 'Transport', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Select linehaul carrier', dep: 'T2', priority: 'Normal', due: 'Today 15:30', timing: 'On Track', done: null, milestone: false, desc: 'Enter forwarding details in Opter.' }
    ],
    data: [{
      group: 'Freight forwarding — pickup and delivery', fields: [
        { k: 'Customer', v: 'Northvolt AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Pickup location', v: 'Northvolt Distribution Central, Älmhult', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Delivery location', v: 'Northvolt Barkarby, Stockholm', src: 'Email body, line 3', rev: 'High Confidence' },
        { k: 'Items', v: '8 EUR pallets, flatpack furniture', src: 'Email body, line 4', rev: 'High Confidence' },
        { k: 'Total weight', v: '3 400 kg', src: 'Email body, line 5', rev: 'High Confidence' }
      ]
    }],
    records: [],
    conversation: [
      {
        type: 'in', from: 'Abel Amare <abel.amare@northvolt.com>', to: 'transport@aalogistik.se', time: 'Today 11:15', subject: 'Transport booking — 8 pallets Älmhult → Stockholm',
        body: 'Hej,\n\nWe have 8 pallets of flatpack furniture (3 400 kg total) ready for collection in Älmhult on Friday morning, delivery to Barkarby, Stockholm.\nPlease confirm forwarding and booking.\n\nMed vänlig hälsning,\nAbel Amare, Northvolt AB', attachments: []
      }
    ],
    activity: [
      { time: 'Today 11:15', actor: 'System', kind: 'Communication', text: 'Email received from abel.amare@northvolt.com', detail: 'Source mailbox: transport@aalogistik.se' }
    ]
  },
  {
    id: '325861', customer: 'Medetec AB', contact: 'Adam Larsson', email: 'adam@medetec.se',
    title: 'Change delivery window — Södertälje express chassis components',
    categories: ['Transport'], caseClass: 'Change Request',
    classification: 'Order Change', types: ['Express'], priority: 'High',
    status: 'Ready for Order', weight: '850 kg',
    lifecycle: 'Active', conditions: [], created: '25 Sep 10:50', lastActivity: '35 min ago', origin: 'ai', originNote: 'Linked to Opter order 246408',
    scenario: 'Transport only',
    items: [
      { id: 'item-1', name: 'Front Axle Chassis Brackets (Cast Steel)', weight: '550 kg', length: '110 cm', width: '70 cm', height: '85 cm', qty: 1, type: 'Steel Gitterbox', notes: 'Urgent line-side feeder' },
      { id: 'item-2', name: 'Suspension Reinforcement Flanges', weight: '300 kg', length: '80 cm', width: '60 cm', height: '50 cm', qty: 1, type: 'Half Pallet', notes: 'Assembly batch #7702' }
    ],
    comm: { state: 'Acknowledged', lastIn: 'Today 10:50', lastOut: 'Today 11:05', waiting: null },
    summary: 'Customer requested moving the express delivery window earlier for chassis parts to Södertälje assembly line. Change validated and ready for Opter update.',
    workItems: [{ id: 'wi1', name: 'Express Transport — Södertälje', dept: 'Transport' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Validate change request feasibility', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'High', due: 'Today 11:15', timing: 'On Track', done: 'Today 11:02', milestone: false, desc: 'Driver confirmed 08:00 delivery is achievable.' },
      { id: 'T2', wi: 'wi1', title: 'Update Opter order time window', dept: 'Transport', assignee: 'Andreas Backström', status: 'In Progress', readiness: 'Ready', priority: 'High', due: 'Today 12:00', timing: 'On Track', done: null, milestone: false, desc: 'Shift planned slot from 13:00 to 08:00.' },
      { id: 'T3', wi: 'wi1', title: 'Send confirmation to customer', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Today 11:30', timing: 'On Track', done: 'Today 11:05', milestone: true, desc: 'Confirmed to Fredrik that express delivery is rescheduled.' }
    ],
    data: [{
      group: 'Express delivery update', fields: [
        { k: 'Customer', v: 'Medetec AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Pickup location', v: 'Oskarshamn Pressverk', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Delivery location', v: 'Medetec Chassimontering, Södertälje', src: 'Email body, line 3', rev: 'High Confidence' },
        { k: 'Items', v: 'Chassis brackets, urgent express', src: 'Email body, line 4', rev: 'High Confidence' },
        { k: 'Total weight', v: '850 kg', src: 'Email body, line 5', rev: 'High Confidence' },
        { k: 'New delivery window', v: 'Tomorrow 08:00 (was 13:00)', src: 'Email body, line 3', rev: 'High Confidence' }
      ]
    }],
    records: [{ type: 'Opter order', number: '246408', created: 'Today 09:15', status: 'Planned', wi: 'Transport' }],
    conversation: [
      {
        type: 'in', from: 'Adam Larsson <adam@medetec.se>', to: 'transport@aalogistik.se', time: 'Today 10:50', subject: 'Change delivery window — Södertälje express chassis components',
        body: 'Hi,\n\nRegarding Opter order 246408: Can we bring delivery forward to 08:00 tomorrow morning instead of 13:00? The assembly line shifted schedule.\n\nRegards,\nAdam Larsson, Medetec AB', attachments: []
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'adam@medetec.se', time: 'Today 11:05', subject: 'Confirmed — delivery updated to 08:00 (Order 246408)',
        body: 'Hello Fredrik,\n\nWe have coordinated with the express driver and confirmed delivery tomorrow at 08:00 sharp.\n\nBest regards,\nMalin Andersson, AA Logistik', attachments: []
      }
    ],
    activity: [
      { time: 'Today 10:50', actor: 'System', kind: 'Communication', text: 'Email received from adam@medetec.se' }
    ]
  },
  {
    id: '325862', customer: 'Oriola Sweden AB', contact: 'Adam Runngren', email: 'Adam.Runngren@oriola.com',
    title: 'Rate inquiry for Air Freight — Gothenburg to Munich',
    categories: ['Freight Forwarding', 'Transport'], caseClass: 'Inquiry',
    classification: 'Inquiry', types: ['Air Freight'], priority: 'Normal',
    status: 'Needs Review', weight: '420 kg',
    lifecycle: 'Active', conditions: ['Needs Review'], created: '25 Sep 10:15', lastActivity: '50 min ago', origin: 'ai', originNote: 'AI categorized as rate inquiry',
    scenario: 'Air Freight Quote',
    items: [
      { id: 'item-1', name: 'Powertrain Inverter Prototype Housing', weight: '240 kg', length: '95 cm', width: '75 cm', height: '60 cm', qty: 1, type: 'Aviation Wood Crate', notes: 'Shock sensor tagged, handle with care' },
      { id: 'item-2', name: 'Coolant Manifold & Harness Assembly', weight: '180 kg', length: '85 cm', width: '65 cm', height: '55 cm', qty: 1, type: 'Aviation Wood Crate', notes: 'Moisture barrier sealed' }
    ],
    comm: { state: 'Response Required', lastIn: 'Today 10:15', lastOut: null, waiting: '50 min' },
    summary: 'Air freight quote request for time-sensitive prototype components from Gothenburg to Munich airport hub.',
    workItems: [{ id: 'wi1', name: 'Air Freight Desk', dept: 'Freight Forwarding' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Request airline cargo rates (GOT-MUC)', dept: 'Freight Forwarding', assignee: 'Andreas Backström', status: 'In Progress', readiness: 'Ready', priority: 'Normal', due: 'Today 13:00', timing: 'On Track', done: null, milestone: false, desc: 'Check Lufthansa Cargo and SAS rates for 420 kg.' },
      { id: 'T2', wi: 'wi1', title: 'Compile quotation and send to Oriola Sweden AB', dept: 'Freight Forwarding', assignee: 'Malin Andersson', status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Request airline cargo rates (GOT-MUC)', dep: 'T1', priority: 'Normal', due: 'Today 15:00', timing: 'On Track', done: null, milestone: true, desc: 'Valid 7 days.' }
    ],
    data: [{
      group: 'Air freight quote parameters', fields: [
        { k: 'Customer', v: 'Oriola Sweden AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Origin', v: 'Landvetter Airport (GOT), Gothenburg', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Destination', v: 'Munich Airport (MUC), Germany', src: 'Email body, line 3', rev: 'High Confidence' },
        { k: 'Items', v: '2 crates prototype parts', src: 'Email body, line 4', rev: 'High Confidence' },
        { k: 'Total weight', v: '420 kg', src: 'Email body, line 5', rev: 'High Confidence' }
      ]
    }],
    records: [],
    conversation: [
      {
        type: 'in', from: 'Adam Runngren <Adam.Runngren@oriola.com>', to: 'transport@aalogistik.se', time: 'Today 10:15', subject: 'Rate inquiry for Air Freight — Gothenburg to Munich',
        body: 'Hello AA Logistik,\n\nWe need urgent air freight pricing for 2 crates (420 kg total) of powertrain prototype parts from Gothenburg Landvetter to Munich next Monday.\nPlease provide flight options and rates.\n\nBest regards,\nAdam Runngren, Oriola Sweden AB', attachments: []
      }
    ],
    activity: [
      { time: 'Today 10:15', actor: 'System', kind: 'Communication', text: 'Email received from Adam.Runngren@oriola.com' }
    ]
  },
  {
    id: '325863', customer: 'Voith Hydro AB', contact: 'Aguilar, Diana (external)', email: 'diana.aguilar-extern@voith.com',
    title: 'Dangerous goods ADR transport to Borås distribution centre',
    categories: ['Transport'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Dangerous Goods'], priority: 'Urgent',
    status: 'Ready for Order', weight: '1 250 kg',
    lifecycle: 'Active', conditions: [], created: '25 Sep 09:40', lastActivity: '1 h ago', origin: 'ai', originNote: 'ADR classification detected',
    scenario: 'Transport only',
    items: [
      { id: 'item-1', name: 'Perfume Essence Base Concentrate (UN 1263)', weight: '850 kg', length: '120 cm', width: '80 cm', height: '110 cm', qty: 2, type: 'EUR Pallet / Steel Drum', notes: 'ADR Class 3, Flammable liquids, PG II' },
      { id: 'item-2', name: 'Solvent Neutralizer & Blending Compound', weight: '400 kg', length: '120 cm', width: '80 cm', height: '95 cm', qty: 1, type: 'EUR Pallet / IBC', notes: 'ADR Class 3, UN 1263' }
    ],
    comm: { state: 'Acknowledged', lastIn: 'Today 09:40', lastOut: 'Today 09:55', waiting: null },
    summary: 'Urgent order for ADR certified transport of flammable items (Class 3) to Borås DC. ADR safety check completed; ready for Opter order dispatch.',
    workItems: [{ id: 'wi1', name: 'ADR Transport', dept: 'Transport' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Verify ADR certificate & UN numbers', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Urgent', due: 'Today 10:00', timing: 'On Track', done: 'Today 09:50', milestone: false, desc: 'UN 1263 verified; vehicle with EX/II certification required.' },
      { id: 'T2', wi: 'wi1', title: 'Assign ADR-licensed driver', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', dep: 'T1', priority: 'Urgent', due: 'Today 10:30', timing: 'On Track', done: 'Today 09:58', milestone: false, desc: 'Assigned certified carrier.' },
      { id: 'T3', wi: 'wi1', title: 'Create Opter order with ADR annex', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', dep: 'T2', priority: 'Urgent', due: 'Today 11:00', timing: 'On Track', done: 'Today 10:00', milestone: false, desc: 'Opter order 246402 booked.' },
      { id: 'T4', wi: 'wi1', title: 'Send confirmation & ADR transport doc', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', dep: 'T3', priority: 'Normal', due: 'Today 11:15', timing: 'On Track', done: 'Today 09:55', milestone: true, desc: 'Confirmation sent.' }
    ],
    data: [{
      group: 'ADR shipment details', fields: [
        { k: 'Customer', v: 'Voith Hydro AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Pickup location', v: 'Voith Hydro AB Terminal, Norrköping', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Delivery location', v: 'Voith Hydro AB Global Logistics Park, Borås', src: 'Email body, line 3', rev: 'High Confidence' },
        { k: 'Items', v: 'Class 3 Flammable liquids (Perfume base)', src: 'ADR_Declaration_HM.pdf', rev: 'High Confidence' },
        { k: 'Total weight', v: '1 250 kg', src: 'ADR_Declaration_HM.pdf', rev: 'High Confidence' },
        { k: 'UN Number', v: 'UN 1263 Class 3, PG II', src: 'ADR_Declaration_HM.pdf', rev: 'High Confidence' }
      ]
    }],
    records: [{ type: 'Opter order', number: '246402', created: 'Today 10:00', status: 'Planned', wi: 'Transport' }],
    conversation: [
      {
        type: 'in', from: 'Aguilar, Diana (external) <diana.aguilar-extern@voith.com>', to: 'transport@aalogistik.se', time: 'Today 09:40', subject: 'Dangerous goods ADR transport to Borås distribution centre',
        body: 'URGENT:\nWe need ADR-certified transport for 3 pallets (1 250 kg) of perfume extract components (UN 1263, Class 3) from Norrköping to Borås tomorrow at 07:00.\nSafety documentation attached.\n\nAguilar, Diana (external), Voith Hydro AB', attachments: ['ADR_Declaration_HM.pdf']
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'diana.aguilar-extern@voith.com', time: 'Today 09:55', subject: 'Order confirmation — ADR Booking 246402',
        body: 'Hello Sara,\n\nYour transport is confirmed with reference 246402. ADR certified vehicle assigned for pickup in Norrköping at 07:00 tomorrow.\n\nKind regards,\nMalin Andersson, AA Logistik', attachments: []
      }
    ],
    activity: [
      { time: 'Today 09:40', actor: 'System', kind: 'Communication', text: 'Email received from diana.aguilar-extern@voith.com' }
    ]
  },
  {
    id: '325854', customer: 'ABB Robotics Sweden AB', contact: 'Adrian Gradenas', email: 'adrjan.gradenas@se.abb.com',
    title: 'Pickup, store, repack and deliver to Stockholm',
    categories: ['Transport', 'Warehouse', 'Packing'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Warehouse', 'Packing'], priority: 'High',
    status: 'In Progress', weight: '1 840 kg',
    lifecycle: 'Active', conditions: [], created: '25 Sep 08:12', lastActivity: '12 min ago', origin: 'ai', originNote: 'AI proposal confirmed by Malin Andersson',
    scenario: 'Transport + Warehouse + Packing',
    items: [
      { id: 'item-1', name: 'IRB 6700 Articulated Robot Arm Assemblies', weight: '1 200 kg', length: '140 cm', width: '90 cm', height: '110 cm', qty: 2, type: 'Heavy Duty Wood Crate', notes: 'Precision machined surfaces, no stacking' },
      { id: 'item-2', name: 'IRC5 Servo Controller Drives & Cables', weight: '640 kg', length: '120 cm', width: '80 cm', height: '90 cm', qty: 2, type: 'EUR Pallet', notes: 'Repack to specification before final delivery' }
    ],
    comm: { state: 'Acknowledged', lastIn: 'Today 08:12', lastOut: 'Today 10:22', waiting: null },
    summary: 'Customer requested pickup of 4 pallets from Västerås, two days of storage, repacking to customer specification and final delivery to Stockholm. Order confirmed to customer with Opter reference. Transport pickup is in progress; warehouse receiving is next.',
    workItems: [
      { id: 'wi1', name: 'Transport — pickup Västerås', dept: 'Transport' },
      { id: 'wi2', name: 'Warehouse — receive and store', dept: 'Warehouse' },
      { id: 'wi3', name: 'Packing — repack 4 pallets', dept: 'Packing' },
      { id: 'wi4', name: 'Transport — delivery Stockholm', dept: 'Transport' },
      { id: 'wi5', name: 'Finance — pricing and invoicing', dept: 'Finance' }
    ],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Validate transport details', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'High', due: 'Today 09:30', timing: 'On Track', done: 'Today 09:42', milestone: false, desc: 'Check pickup, delivery, goods and dimensions against the customer email and packing list.' },
      { id: 'T2', wi: 'wi1', title: 'Create Opter order', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', dep: 'T1', priority: 'High', due: 'Today 10:30', timing: 'On Track', done: 'Today 10:19', milestone: false, desc: 'Create the transport order in Opter after human review of extracted data.' },
      { id: 'T3', wi: 'wi1', title: 'Confirm order to customer', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', dep: 'T2', priority: 'Normal', due: 'Today 11:00', timing: 'On Track', done: 'Today 10:22', milestone: true, desc: 'Send order confirmation including the Opter reference.' },
      { id: 'T4', wi: 'wi1', title: 'Arrange pickup in Västerås', dept: 'Transport', assignee: 'Andreas Backström', status: 'In Progress', readiness: 'Ready', dep: 'T2', priority: 'High', due: 'Today 12:00', timing: 'On Track', done: null, milestone: false, desc: 'Assign vehicle and confirm pickup slot at Finnslätten.' },
      { id: 'T5', wi: 'wi2', title: 'Receive 4 pallets', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Arrange pickup in Västerås', dep: 'T4', priority: 'High', due: 'Today 14:30', timing: 'On Track', done: null, milestone: false, desc: 'Receive goods at the terminal, check against packing list and register in WMS.' },
      { id: 'T6', wi: 'wi3', title: 'Repack pallets to customer specification', dept: 'Packing', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Receive 4 pallets', dep: 'T5', priority: 'Normal', due: 'Tomorrow 10:00', timing: 'On Track', done: null, milestone: false, desc: 'Repack according to the specification in the customer packing list.' },
      { id: 'T7', wi: 'wi4', title: 'Deliver to Stockholm', dept: 'Transport', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Repack pallets to customer specification', dep: 'T6', priority: 'Normal', due: 'Fri 27 Sep 09:00', timing: 'On Track', done: null, milestone: true, desc: 'Final delivery to Kungens Kurva. Customer-visible milestone.' },
      { id: 'T8', wi: 'wi5', title: 'Prepare pricing and invoice basis', dept: 'Finance', assignee: null, status: 'To Do', readiness: 'Ready', dep: 'T2', priority: 'Normal', due: 'Tomorrow 12:00', timing: 'On Track', done: null, milestone: false, desc: 'Pricing needs the Opter order — which is done, so this can start.', origin: 'ai' },
      { id: 'T9', wi: 'wi5', title: 'Send invoice', dept: 'Finance', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Deliver to Stockholm', dep: 'T7', priority: 'Normal', due: 'Fri 27 Sep 16:00', timing: 'On Track', done: null, milestone: false, desc: '' },
      { id: 'T10', wi: 'wi2', title: 'Book dock slot at the terminal', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Today 11:00', timing: 'On Track', done: 'Today 10:40', milestone: false, desc: '', origin: 'manual' }
    ],
    data: [
      {
        group: 'Transport — pickup and delivery', fields: [
          { k: 'Customer', v: 'ABB Robotics Sweden AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
          { k: 'Pickup location', v: 'Finnslätten, Västerås', src: 'Email body, line 3', rev: 'High Confidence' },
          { k: 'Delivery location', v: 'Kungens Kurva, Stockholm', src: 'Email body, line 5', rev: 'High Confidence' },
          { k: 'Pickup date', v: '25 Sep 2026, 14:00', src: 'Email body, line 3', rev: 'High Confidence' },
          { k: 'Items', v: '4 pallets, robot components', src: 'Packing_list_ABB.pdf, row 1–4', rev: 'High Confidence' },
          { k: 'Dimensions', v: '120 × 80 × 140 cm', src: 'Packing_list_ABB.pdf, row 1', rev: 'High Confidence' },
          { k: 'Pallets', v: '4 (EUR)', src: 'Packing_list_ABB.pdf, summary', rev: 'High Confidence' },
          { k: 'Total weight', v: '1 840 kg', src: 'Packing_list_ABB.pdf, summary', rev: 'High Confidence' }
        ]
      },
      {
        group: 'Warehouse and packing', fields: [
          { k: 'Storage period', v: '2 days', src: 'Email body, line 6', rev: 'High Confidence' },
          { k: 'Repack specification', v: 'Export crates, single stack', src: 'Email body, line 7', rev: 'Review Recommended' },
          { k: 'Customer reference', v: 'PO-44871', src: 'Email subject', rev: 'High Confidence' }
        ]
      }
    ],
    records: [
      { type: 'Opter order', number: '246381', created: 'Today 10:19', status: 'Planned', wi: 'Transport — pickup Västerås' },
      { type: 'WMS reference', number: 'WH-8842', created: 'Today 10:24', status: 'Awaiting goods', wi: 'Warehouse — receive and store' }
    ],
    conversation: [
      {
        type: 'in', from: 'Adrian Gradenas <adrjan.gradenas@se.abb.com>', to: 'transport@aalogistik.se', time: 'Today 08:12', subject: 'Transport request — 4 pallets Västerås → Stockholm (PO-44871)',
        body: 'Hello,\n\nWe need 4 pallets of robot components collected at Finnslätten today at 14:00.\nPlease store them for two days, repack into export crates and deliver to Kungens Kurva in Stockholm on Friday morning.\n\nPacking list attached.\n\nBest regards,\nAdrian Gradenas, ABB Robotics Sweden AB',
        attachments: ['Packing_list_ABB.pdf']
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'adrjan.gradenas@se.abb.com', time: 'Today 10:22', subject: 'Order confirmation — PO-44871',
        body: 'Hello Anna,\n\nThank you for your request. Your transport is booked with reference 246381.\n\nPickup: Finnslätten, Västerås, 25 Sep at 14:00\nStorage: 2 days at our Västerås terminal\nDelivery: Kungens Kurva, Stockholm, 27 Sep morning\n\nWe will confirm once the goods have been received at the terminal.\n\nKind regards,\nMalin Andersson, AA Logistik', attachments: []
      },
      { type: 'internal', from: 'Malin Andersson', time: 'Today 10:31', body: '@Andreas Backström please confirm the pickup slot at Finnslätten — reception closes 15:00 today.', attachments: [], mentions: ['Andreas Backström'] }
    ],
    activity: [
      { time: 'Today 08:12', actor: 'System', kind: 'Communication', text: 'Email received from adrjan.gradenas@se.abb.com', detail: 'Source mailbox: transport@aalogistik.se · 1 attachment' },
      { time: 'Today 08:12', actor: 'AI', kind: 'System', text: 'Message processed — Transport + Warehouse + Packing / Confirmed Order', detail: 'No existing case matched. New case proposed.' },
      { time: 'Today 08:14', actor: 'Malin Andersson', kind: 'System', text: 'Classification confirmed, case created', detail: 'Priority set to High (customer rule: ABB Robotics)' },
      { time: 'Today 08:14', actor: 'System', kind: 'Tasks', text: '7 tasks generated from templates', detail: 'Transport + Confirmed Order, Warehouse + Confirmed Order, Packing + Confirmed Order' },
      { time: 'Today 08:31', actor: 'AI', kind: 'Data', text: '8 fields extracted from email and packing list', detail: '1 field marked Review Recommended: Repack specification' },
      { time: 'Today 09:42', actor: 'Malin Andersson', kind: 'Tasks', text: 'Task "Validate transport details" changed To Do → Done', detail: '' },
      { time: 'Today 10:19', actor: 'System', kind: 'Orders', text: 'Opter order 246381 created', detail: 'Created by Andreas Backström after review · simulated integration' },
      { time: 'Today 10:22', actor: 'Malin Andersson', kind: 'Communication', text: 'Order confirmation sent to adrjan.gradenas@se.abb.com', detail: 'Communication state: Response Required → Acknowledged' },
      { time: 'Today 10:24', actor: 'System', kind: 'Orders', text: 'WMS reference WH-8842 registered', detail: 'Simulated integration' },
      { time: 'Today 11:41', actor: 'Andreas Backström', kind: 'Tasks', text: 'Task "Arrange pickup in Västerås" changed To Do → In Progress', detail: '' }
    ]
  },
  {
    id: '325855', customer: 'ABB Switzerland AG', contact: 'Abdela Zildzic Mehmedovic', email: 'logistics.tillberga@abb.com',
    title: 'Shipment tomorrow — 2 pallets Ludvika → Göteborg',
    categories: ['Transport'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Standard Transport'], priority: 'High',
    status: 'Awaiting Information', weight: '2 100 kg',
    lifecycle: 'Active', conditions: ['Missing Information', 'Waiting for Customer'], created: '25 Sep 08:55', lastActivity: '1 h ago', origin: 'ai', originNote: 'High-confidence AI classification',
    scenario: 'Transport only',
    items: [
      { id: 'item-1', name: 'High-Voltage GIS Switchgear Modules', weight: '1 400 kg', length: '130 cm', width: '90 cm', height: '140 cm', qty: 1, type: 'EUR Pallet / Wooden Base', notes: 'Heavy duty, delicate gas-insulated busbar' },
      { id: 'item-2', name: 'Control Cubicle & Relaying Panels', weight: '700 kg', length: '120 cm', width: '80 cm', height: '120 cm', qty: 1, type: 'EUR Pallet', notes: 'Electronic protection instrumentation' }
    ],
    comm: { state: 'Waiting for Customer', lastIn: 'Today 08:55', lastOut: 'Today 09:05', waiting: '2 h 40 min' },
    summary: 'Customer asked for transport of 2 pallets from Ludvika to Göteborg tomorrow. Dimensions and pallet information were not provided, and the delivery address in the email conflicts with the address in the attached delivery note. A clarification request was sent at 09:05.',
    workItems: [{ id: 'wi1', name: 'Transport — Ludvika → Göteborg', dept: 'Transport' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Validate transport details', dept: 'Transport', assignee: 'Malin Andersson', status: 'In Progress', readiness: 'Ready', priority: 'High', due: 'Today 12:00', timing: 'Due Soon', done: null, milestone: false, desc: 'Two required fields are missing and one delivery address conflict needs resolution.' },
      { id: 'T2', wi: 'wi1', title: 'Request missing information from customer', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'High', due: 'Today 09:30', timing: 'On Track', done: 'Today 09:05', milestone: true, desc: 'Ask for dimensions, pallet information and confirmation of the delivery address.', origin: 'ai' },
      { id: 'T3', wi: 'wi1', title: 'Create Opter order', dept: 'Transport', assignee: null, status: 'To Do', readiness: 'Waiting for Customer', waitingFor: 'Customer reply with dimensions', priority: 'High', due: 'Today 16:00', timing: 'On Track', done: null, milestone: false, desc: 'Blocked until required transport data is complete.' },
      { id: 'T4', wi: 'wi1', title: 'Confirm order to customer', dept: 'Transport', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Create Opter order', dep: 'T3', priority: 'Normal', due: 'Today 17:00', timing: 'On Track', done: null, milestone: true, desc: '' }
    ],
    data: [
      {
        group: 'Transport — pickup and delivery', fields: [
          { k: 'Customer', v: 'ABB Switzerland AG', src: 'Sender domain + customer master', rev: 'High Confidence' },
          { k: 'Pickup location', v: 'Ludvika, Kabelvägen 3', src: 'Email body, line 2', rev: 'High Confidence' },
          {
            k: 'Delivery location', v: 'Göteborg Hamn, port 4', src: 'Email body, line 4', rev: 'Conflict Detected',
            conflict: { a: 'Göteborg Hamn, port 4 — email body', b: 'Ringön, Göteborg — Delivery_note_HE.pdf' }
          },
          { k: 'Pickup date', v: '26 Sep 2026, morning', src: 'Email body, line 2', rev: 'High Confidence' },
          { k: 'Items', v: '2 pallets, switchgear parts', src: 'Email body, line 3', rev: 'High Confidence' },
          { k: 'Dimensions', v: '', src: 'Not found in email or attachment', rev: 'Missing' },
          { k: 'Pallets', v: '', src: 'Not found in email or attachment', rev: 'Missing' }
        ]
      }
    ],
    records: [],
    conversation: [
      {
        type: 'in', from: 'Abdela Zildzic Mehmedovic <logistics.tillberga@abb.com>', to: 'transport@aalogistik.se', time: 'Today 08:55', subject: 'Shipment tomorrow',
        body: 'Hi,\n\nWe have a shipment going out tomorrow morning from Ludvika, Kabelvägen 3.\n2 pallets with switchgear parts, delivery to Göteborg Hamn, port 4.\n\nDelivery note attached.\n\nRegards,\nPer', attachments: ['Delivery_note_HE.pdf']
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'logistics.tillberga@abb.com', time: 'Today 09:05', subject: 'Additional information required for your transport request',
        body: 'Hello Per,\n\nThank you for your request — we have registered it.\n\nBefore we can book the transport, please confirm:\n• Dimensions of the two pallets\n• Pallet type and whether they are stackable\n• Delivery address: your email states Göteborg Hamn, port 4, while the attached delivery note states Ringön\n\nAs soon as we have this we will confirm the booking.\n\nKind regards,\nMalin Andersson, AA Logistik', attachments: []
      }
    ],
    activity: [
      { time: 'Today 08:55', actor: 'System', kind: 'Communication', text: 'Email received from logistics.tillberga@abb.com', detail: 'Source mailbox: transport@aalogistik.se · 1 attachment' },
      { time: 'Today 08:56', actor: 'AI', kind: 'System', text: 'Message processed — Transport / Confirmed Order', detail: 'Confidence high on category, no existing case matched' },
      { time: 'Today 08:57', actor: 'AI', kind: 'Data', text: 'Missing information detected', detail: 'Dimensions, pallet information' },
      { time: 'Today 08:57', actor: 'AI', kind: 'Data', text: 'Conflict detected on delivery location', detail: 'Email body vs Delivery_note_HE.pdf' },
      { time: 'Today 09:05', actor: 'Malin Andersson', kind: 'Communication', text: 'Clarification request sent to logistics.tillberga@abb.com', detail: 'Communication state: Response Required → Waiting for Customer' }
    ]
  },
  {
    id: '325856', customer: 'ABB Oy', contact: 'Annika Poikela', email: 'annika.poikela@se.abb.com',
    title: 'Quote request — 4 pallets Västerås → Stockholm next week',
    categories: ['Transport'], caseClass: 'Inquiry',
    classification: 'Inquiry', types: ['Standard Transport'], priority: 'Normal',
    status: 'Awaiting Information', weight: '960 kg',
    lifecycle: 'Active', conditions: ['Waiting for Customer'], created: '24 Sep 14:20', lastActivity: 'Yesterday 16:40', origin: 'rule', originNote: 'Inquiry rule: price request from a known customer',
    scenario: 'Price request',
    items: [
      { id: 'item-1', name: 'Foldable Plywood Packaging Sleeves (ExPak)', weight: '480 kg', length: '120 cm', width: '80 cm', height: '110 cm', qty: 2, type: 'EUR Pallet', notes: 'Flatpack collapsed boxes' },
      { id: 'item-2', name: 'Heavy Duty Corrugated Inserts & Pallet Collars', weight: '480 kg', length: '120 cm', width: '80 cm', height: '100 cm', qty: 2, type: 'EUR Pallet', notes: 'Standard fit' }
    ],
    comm: { state: 'Waiting for Customer', lastIn: 'Yesterday 14:20', lastOut: 'Yesterday 16:40', waiting: '18 h' },
    summary: 'Customer asked for a price for 4 pallets from Västerås to Stockholm next week. A quote was sent yesterday at 16:40. Awaiting customer decision.',
    workItems: [{ id: 'wi1', name: 'Inquiry handling', dept: 'Transport' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Review inquiry', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Yesterday 15:00', timing: 'On Track', done: 'Yesterday 14:48', milestone: false, desc: '' },
      { id: 'T2', wi: 'wi1', title: 'Obtain pricing and operational input', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Yesterday 16:00', timing: 'On Track', done: 'Yesterday 15:52', milestone: false, desc: '' },
      { id: 'T3', wi: 'wi1', title: 'Prepare response', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Yesterday 16:30', timing: 'On Track', done: 'Yesterday 16:28', milestone: false, desc: '' },
      { id: 'T4', wi: 'wi1', title: 'Send quote', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: 'Yesterday 17:00', timing: 'On Track', done: 'Yesterday 16:40', milestone: true, desc: '' },
      { id: 'T5', wi: 'wi1', title: 'Follow up on quote', dept: 'Transport', assignee: 'Malin Andersson', status: 'To Do', readiness: 'Waiting for Customer', waitingFor: 'Customer decision', priority: 'Normal', due: 'Mon 28 Sep 10:00', timing: 'On Track', done: null, milestone: false, desc: '' }
    ],
    data: [
      {
        group: 'Inquiry', fields: [
          { k: 'Customer', v: 'ABB Oy', src: 'Sender domain + customer master', rev: 'High Confidence' },
          { k: 'Pickup location', v: 'Västerås', src: 'Email body, line 1', rev: 'High Confidence' },
          { k: 'Delivery location', v: 'Stockholm', src: 'Email body, line 1', rev: 'High Confidence' },
          { k: 'Items', v: '4 pallets', src: 'Email body, line 1', rev: 'High Confidence' },
          { k: 'Requested week', v: 'Week 40', src: 'Email body, line 2', rev: 'High Confidence' },
          { k: 'Quoted price', v: '4 850 SEK', src: 'Manually entered by Andreas Backström', rev: 'High Confidence', edited: true }
        ]
      }
    ],
    records: [],
    conversation: [
      {
        type: 'in', from: 'Annika Poikela <annika.poikela@se.abb.com>', to: 'transport@aalogistik.se', time: 'Yesterday 14:20', subject: 'Price request — Västerås to Stockholm',
        body: 'Hello,\n\nCan you quote 4 pallets from Västerås to Stockholm next week?\n\nRegards,\nKarin', attachments: []
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'annika.poikela@se.abb.com', time: 'Yesterday 16:40', subject: 'Quote — Västerås to Stockholm, week 40',
        body: 'Hello Karin,\n\nThank you for your request. Our price for 4 pallets Västerås → Stockholm in week 40 is 4 850 SEK excluding VAT, based on standard delivery within 24 hours.\n\nThe quote is valid for 14 days.\n\nKind regards,\nMalin Andersson, AA Logistik', attachments: []
      }
    ],
    activity: [
      { time: 'Yesterday 14:20', actor: 'System', kind: 'Communication', text: 'Email received from annika.poikela@se.abb.com', detail: 'Source mailbox: transport@aalogistik.se' },
      { time: 'Yesterday 14:21', actor: 'AI', kind: 'System', text: 'Message processed — Transport / Inquiry', detail: 'Inquiry task template applied' },
      { time: 'Yesterday 16:40', actor: 'Malin Andersson', kind: 'Communication', text: 'Quote sent to annika.poikela@se.abb.com', detail: 'Communication state: Response Required → Waiting for Customer' }
    ]
  },
  {
    id: '325857', customer: 'ALSTOM Rail Sweden AB', contact: 'Jonas Ek', email: 'jonas.ek@alstom.com',
    title: 'Urgent pickup Nyköping → Västerås terminal',
    categories: ['Transport', 'Freight Forwarding'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Freight Forwarding', 'Express'], priority: 'Urgent',
    status: 'In Progress', weight: '1 480 kg',
    lifecycle: 'Active', conditions: ['At Risk', 'Update Recommended'], created: '25 Sep 09:12', lastActivity: '34 min ago', origin: 'ai', originNote: 'Created automatically — AI confidence 95%',
    scenario: 'Transport + Freight Forwarding',
    items: [
      { id: 'item-1', name: 'Bogie Brake Caliper Subassemblies', weight: '960 kg', length: '80 cm', width: '60 cm', height: '90 cm', qty: 4, type: 'Half Pallet', notes: 'Machined cast iron, line-side stock' },
      { id: 'item-2', name: 'Traction Inverter Filter Capacitors', weight: '520 kg', length: '80 cm', width: '60 cm', height: '90 cm', qty: 2, type: 'Half Pallet', notes: 'Fragile electrical components' }
    ],
    comm: { state: 'Update Recommended', lastIn: 'Today 09:12', lastOut: 'Today 09:20', waiting: null },
    summary: 'Urgent pickup in Nyköping for onward freight forwarding from the Västerås terminal. The carrier slot booking is overdue by 24 minutes and the promised same-day pickup is at risk. A proactive customer update is recommended.',
    workItems: [
      { id: 'wi1', name: 'Transport — Nyköping pickup', dept: 'Transport' },
      { id: 'wi2', name: 'Freight forwarding — onward booking', dept: 'Freight Forwarding' }
    ],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Validate transport details', dept: 'Transport', assignee: 'Malin Andersson', status: 'Done', readiness: 'Ready', priority: 'Urgent', due: 'Today 09:45', timing: 'On Track', done: 'Today 09:38', milestone: false, desc: '' },
      { id: 'T2', wi: 'wi1', title: 'Create Opter order', dept: 'Transport', assignee: 'Andreas Backström', status: 'Done', readiness: 'Ready', priority: 'Urgent', due: 'Today 10:00', timing: 'On Track', done: 'Today 09:55', milestone: false, desc: '' },
      { id: 'T3', wi: 'wi1', title: 'Book carrier slot', dept: 'Transport', assignee: 'Andreas Backström', status: 'To Do', readiness: 'Ready', dep: 'T2', priority: 'Urgent', due: 'Today 11:00', timing: 'Overdue', overdueBy: '24 min', done: null, milestone: false, desc: 'No carrier confirmed for the Nyköping pickup. Same-day promise is at risk.' },
      { id: 'T4', wi: 'wi2', title: 'Prepare forwarding documents', dept: 'Freight Forwarding', assignee: null, status: 'To Do', readiness: 'Ready', priority: 'High', due: 'Today 15:00', timing: 'Due Soon', done: null, milestone: false, desc: 'Unassigned — needs an owner in Freight Forwarding.', origin: 'manual' },
      { id: 'T5', wi: 'wi2', title: 'Inform customer about pickup time', dept: 'Freight Forwarding', assignee: null, status: 'To Do', readiness: 'Waiting for Task', waitingFor: 'Book carrier slot', dep: 'T3', priority: 'High', due: 'Today 16:00', timing: 'On Track', done: null, milestone: true, desc: '' }
    ],
    data: [
      {
        group: 'Transport — pickup and delivery', fields: [
          { k: 'Customer', v: 'ALSTOM Rail Sweden AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
          { k: 'Pickup location', v: 'Nyköping, Industrigatan 12', src: 'Email body, line 2', rev: 'High Confidence' },
          { k: 'Delivery location', v: 'AA Logistik terminal, Västerås', src: 'Email body, line 3', rev: 'High Confidence' },
          { k: 'Items', v: '6 colli, spare parts', src: 'Email body, line 3', rev: 'High Confidence' },
          { k: 'Dimensions', v: '80 × 60 × 90 cm (per colli)', src: 'Email body, line 4', rev: 'High Confidence' },
          { k: 'Pallets', v: '2 (half pallets)', src: 'Email body, line 4', rev: 'Review Recommended' },
          { k: 'Total weight', v: '1 480 kg', src: 'Waybill', rev: 'High Confidence' }
        ]
      }
    ],
    records: [{ type: 'Opter order', number: '246395', created: 'Today 09:55', status: 'Awaiting carrier', wi: 'Transport — Nyköping pickup' }],
    conversation: [
      {
        type: 'in', from: 'Jonas Ek <jonas.ek@alstom.com>', to: 'transport@aalogistik.se', time: 'Today 09:12', subject: 'URGENT pickup Nyköping today',
        body: 'Hi,\n\nWe need an urgent pickup today in Nyköping, Industrigatan 12.\n6 colli of spare parts to your Västerås terminal for onward forwarding.\nDimensions 80x60x90 per colli, 2 half pallets.\n\nThis is time critical.\n\nJonas', attachments: []
      },
      {
        type: 'out', from: 'transport@aalogistik.se', to: 'jonas.ek@alstom.com', time: 'Today 09:20', subject: 'Received — urgent pickup Nyköping',
        body: 'Hello Jonas,\n\nWe have received your request and are arranging the pickup today. We will confirm the pickup time shortly.\n\nKind regards,\nMalin Andersson, AA Logistik', attachments: []
      }
    ],
    activity: [
      { time: 'Today 09:12', actor: 'System', kind: 'Communication', text: 'Email received from jonas.ek@alstom.com', detail: 'Source mailbox: transport@aalogistik.se' },
      { time: 'Today 09:13', actor: 'AI', kind: 'System', text: 'Message processed — Transport + Freight Forwarding / Confirmed Order', detail: 'Priority suggested: Urgent (keyword "time critical")' },
      { time: 'Today 09:20', actor: 'Malin Andersson', kind: 'Communication', text: 'Acknowledgement sent to jonas.ek@alstom.com', detail: '' },
      { time: 'Today 09:55', actor: 'System', kind: 'Orders', text: 'Opter order 246395 created', detail: 'Simulated integration' },
      { time: 'Today 11:24', actor: 'System', kind: 'Tasks', text: 'Task "Book carrier slot" is overdue', detail: 'Case condition set to At Risk · customer update recommended' }
    ]
  },
  {
    id: '325858', customer: 'ABB Robotics Sweden AB', contact: 'Adrian Gradenas', email: 'adrjan.gradenas@se.abb.com',
    title: 'Warehouse receiving — inbound container',
    categories: ['Warehouse'], caseClass: 'Confirmed Order',
    classification: 'Document Request', types: ['Warehouse'], priority: 'Normal',
    status: 'Completed', weight: '4 800 kg',
    lifecycle: 'Completed', conditions: [], created: '23 Sep 07:40', lastActivity: 'Yesterday 15:10', origin: 'manual', originNote: 'Created by Anna Svensson',
    scenario: 'Warehouse only',
    comm: { state: 'No Action Required', lastIn: '23 Sep 07:40', lastOut: 'Yesterday 15:10', waiting: null },
    summary: 'Inbound container received, unloaded and registered in WMS. Completion update sent to the customer.',
    workItems: [{ id: 'wi1', name: 'Warehouse — inbound handling', dept: 'Warehouse' }],
    tasks: [
      { id: 'T1', wi: 'wi1', title: 'Prepare receiving', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: '23 Sep 10:00', timing: 'On Track', done: '23 Sep 09:20', milestone: false, desc: '' },
      { id: 'T2', wi: 'wi1', title: 'Receive goods', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: '23 Sep 14:00', timing: 'On Track', done: '23 Sep 13:35', milestone: false, desc: '' },
      { id: 'T3', wi: 'wi1', title: 'Register in WMS', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: '24 Sep 10:00', timing: 'On Track', done: '24 Sep 09:05', milestone: false, desc: '' },
      { id: 'T4', wi: 'wi1', title: 'Send completion update', dept: 'Warehouse', assignee: 'Anna Svensson', status: 'Done', readiness: 'Ready', priority: 'Normal', due: '24 Sep 16:00', timing: 'On Track', done: 'Yesterday 15:10', milestone: true, desc: '' }
    ],
    data: [{
      group: 'Warehouse', fields: [
        { k: 'Customer', v: 'ABB Robotics Sweden AB', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Container', v: 'MSKU 447 128-3', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Colli', v: '38', src: 'Manifest_ABB.pdf', rev: 'High Confidence' },
        { k: 'Total weight', v: '4 800 kg', src: 'Manifest_ABB.pdf', rev: 'High Confidence' }
      ]
    }],
    records: [{ type: 'WMS reference', number: 'WH-8811', created: '24 Sep 09:05', status: 'Stored', wi: 'Warehouse — inbound handling' }],
    conversation: [
      { type: 'in', from: 'Adrian Gradenas <adrjan.gradenas@se.abb.com>', to: 'terminal@aalogistik.se', time: '23 Sep 07:40', subject: 'Inbound container this week', body: 'Hello,\n\nContainer MSKU 447 128-3 arrives on Wednesday, 38 colli. Please receive and store.\n\nAnna', attachments: ['Manifest_ABB.pdf'] },
      { type: 'out', from: 'terminal@aalogistik.se', to: 'adrjan.gradenas@se.abb.com', time: 'Yesterday 15:10', subject: 'Goods received and stored', body: 'Hello Anna,\n\nThe container has been received, unloaded and registered under reference WH-8811. All 38 colli are accounted for.\n\nKind regards,\nAnna Svensson, AA Logistik', attachments: [] }
    ],
    activity: [
      { time: '23 Sep 07:40', actor: 'System', kind: 'Communication', text: 'Email received from adrjan.gradenas@se.abb.com', detail: 'Source mailbox: terminal@aalogistik.se' },
      { time: 'Yesterday 15:10', actor: 'Anna Svensson', kind: 'Communication', text: 'Completion update sent', detail: '' },
      { time: 'Yesterday 15:11', actor: 'Anna Svensson', kind: 'System', text: 'Case completed', detail: 'All tasks done, customer informed' }
    ]
  },
  {
    id: '325859', customer: 'ABB Oy', contact: 'Annika Poikela', email: 'annika.poikela@se.abb.com',
    title: 'Packaging materials pickup next Tuesday',
    categories: ['Transport', 'Packing'], caseClass: 'Confirmed Order',
    classification: 'New Transport Order', types: ['Standard Transport', 'Packing'], priority: 'Normal',
    status: 'Needs Review', weight: '1 100 kg',
    lifecycle: 'New', conditions: ['Needs Review'], created: '25 Sep 07:58', lastActivity: '3 h ago', origin: 'ai', originNote: 'AI proposal — waiting for confirmation',
    scenario: 'Transport + Packing',
    items: [
      { id: 'item-1', name: 'Custom Foam Dunnage Cushioning Sets', weight: '500 kg', length: '120 cm', width: '80 cm', height: '130 cm', qty: 2, type: 'EUR Pallet', notes: 'ESD-safe protective packaging' },
      { id: 'item-2', name: 'Collapsible Bulk Containers & Lids', weight: '600 kg', length: '120 cm', width: '80 cm', height: '140 cm', qty: 2, type: 'EUR Pallet', notes: 'Repacking required at terminal' }
    ],
    comm: { state: 'Response Required', lastIn: 'Today 07:58', lastOut: null, waiting: '3 h 20 min' },
    summary: 'New request for collection of packaging materials next Tuesday with repacking at the terminal. AI classification is proposed but not yet confirmed, so no tasks have been generated and no acknowledgement has been sent.',
    intake: true,
    workItems: [],
    tasks: [],
    data: [{
      group: 'Transport — pickup and delivery', fields: [
        { k: 'Customer', v: 'ABB Oy', src: 'Sender domain + customer master', rev: 'High Confidence' },
        { k: 'Pickup location', v: 'ABB Oy, Hallstahammar', src: 'Email body, line 2', rev: 'High Confidence' },
        { k: 'Delivery location', v: 'AA Logistik terminal, Västerås', src: 'Email body, line 3', rev: 'Review Recommended' },
        { k: 'Items', v: 'Packaging materials, quantity not stated', src: 'Email body, line 2', rev: 'Review Recommended' },
        { k: 'Dimensions', v: '', src: 'Not found', rev: 'Missing' },
        { k: 'Pallets', v: '', src: 'Not found', rev: 'Missing' }
      ]
    }],
    records: [],
    conversation: [
      {
        type: 'in', from: 'Annika Poikela <annika.poikela@se.abb.com>', to: 'transport@aalogistik.se', time: 'Today 07:58', subject: 'Packaging materials pickup next Tuesday',
        body: 'Hi,\n\nWe would like a pickup of packaging materials at Hallstahammar next Tuesday, to be repacked at your terminal before onward transport.\n\nCan you handle this?\n\nKarin', attachments: []
      }
    ],
    activity: [
      { time: 'Today 07:58', actor: 'System', kind: 'Communication', text: 'Email received from annika.poikela@se.abb.com', detail: 'Source mailbox: transport@aalogistik.se' },
      { time: 'Today 07:59', actor: 'AI', kind: 'System', text: 'Classification proposed — Transport + Packing / Confirmed Order', detail: 'Awaiting human confirmation before tasks are generated' }
    ]
  }
];

export const INITIAL_MESSAGES: InboxMessage[] = [
  {
    id: 'M1', date: '25 Sep 2026', time: '10:42', customer: 'ABB Robotics Sweden AB', sender: 'adrjan.gradenas@se.abb.com', subject: 'Please deliver tomorrow instead',
    ai: 'Transport / Change Request', intent: ['Transport', 'Change Request'], state: 'Possible Existing Case', match: '325854', caseId: null,
    reason: 'Semantic match — same customer, route and goods, no case reference in the email', priority: 'High', mailbox: 'transport@aalogistik.se', attention: true,
    conf: 94, icon: 'truck', assignee: null,
    body: 'Hi,\n\nSomething changed on our side — can you deliver the 4 pallets to Stockholm tomorrow instead of Friday?\n\nAnna',
    extracted: ['Delivery date change: 27 Sep → 26 Sep', 'Route: Västerås → Stockholm', '4 pallets'],
    suggestion: 'Link to 325854 and generate a task to update the Opter pickup and delivery date.'
  },
  {
    id: 'M2', date: '25 Sep 2026', time: '10:20', customer: 'ABB Switzerland AG', sender: 'logistics.tillberga@abb.com', subject: 'Re: Additional information required for your transport request',
    ai: 'Transport / Confirmed Order', intent: ['Transport', 'Reply to clarification'], state: 'Customer Replied', match: null, caseId: '325855', reply: true, unreadReply: true,
    reason: 'Reply in the thread of 325855 — the customer sent the dimensions and pallet type and confirmed the delivery address', priority: 'High', mailbox: 'transport@aalogistik.se', attention: true,
    conf: 95, icon: 'truck', assignee: 'Malin Andersson',
    body: 'Hi Malin,\n\nSorry for that. Dimensions are 120x80x105, two EUR pallets, not stackable.\nDelivery is Ringön, the delivery note is correct.\n\nPer',
    extracted: ['Dimensions: 120 × 80 × 105 cm', 'Pallets: 2 EUR, not stackable', 'Delivery: Ringön, Göteborg (confirmed)'],
    suggestion: 'Open the case — the reply has filled in the missing data.'
  },
  {
    id: 'M3', date: '25 Sep 2026', time: '10:04', customer: 'Unknown sender', sender: 'logistik@nordkom.se', subject: 'Fwd: leverans v.40',
    ai: 'Could not classify', intent: ['Unknown', 'Needs classification'], state: 'Classification Unclear', match: null, caseId: null,
    reason: 'Unknown sender domain, forwarded thread, no clear request in the body', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true,
    conf: 67, icon: 'unknown', assignee: null,
    body: '---------- Forwarded message ----------\nSe nedan, kan ni hjälpa till med detta?\n\n/M',
    extracted: ['No customer match in customer master', 'No pickup or delivery address found'],
    suggestion: 'Human classification required. Choose category and customer, or create a new customer.'
  },
  {
    id: 'M4', date: '25 Sep 2026', time: '09:48', customer: 'ALSTOM Rail Sweden AB', sender: 'noreply@alstom-edi.com', subject: 'Transport order 8841-B (scanned)',
    ai: 'Processing failed', intent: ['Document', 'Processing'], state: 'Processing Failed', match: null, caseId: null,
    reason: 'Attachment could not be read — scanned image without text layer', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true,
    conf: null, icon: 'doc', assignee: 'IT Support',
    body: 'Automated message. Transport order attached.',
    extracted: ['Attachment: TO_8841-B.pdf — unreadable', 'No data extracted'],
    suggestion: 'The message is still here. Open the attachment manually and classify, or retry processing.'
  },
  {
    id: 'M5', date: '25 Sep 2026', time: '09:31', customer: 'ABB Oy', sender: 'annika.poikela@se.abb.com', subject: 'Re: Quote — Västerås to Stockholm, week 40', reply: true, unreadReply: true,
    ai: 'Transport / Inquiry follow-up', intent: ['Transport', 'Inquiry follow-up'], state: 'Processed', match: null, caseId: '325856',
    reason: 'Reply in the thread of 325856 — linked by email thread reference', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: false,
    conf: 97, icon: 'chat', assignee: 'Malin Andersson',
    body: 'Thanks, we will come back to you shortly.', extracted: ['No new operational data'], suggestion: 'No action required.'
  },
  {
    id: 'M6', date: '25 Sep 2026', time: '09:12', customer: 'ALSTOM Rail Sweden AB', sender: 'jonas.ek@alstom.com', subject: 'URGENT pickup Nyköping today',
    ai: 'Transport + Freight Forwarding / Confirmed Order', intent: ['Transport + Forwarding', 'Confirmed Order'], state: 'Processed', match: null, caseId: '325857',
    reason: 'New case created automatically after high-confidence classification', priority: 'Urgent', mailbox: 'transport@aalogistik.se', attention: false,
    conf: 95, icon: 'truck', assignee: 'Andreas Backström',
    body: 'We need an urgent pickup today in Nyköping, Industrigatan 12.', extracted: ['Pickup: Nyköping', '6 colli', 'Priority signal: "time critical"'], suggestion: 'No action required.'
  },
  {
    id: 'M7', date: '25 Sep 2026', time: '08:55', customer: 'ABB Switzerland AG', sender: 'logistics.tillberga@abb.com', subject: 'Shipment tomorrow',
    ai: 'Transport / Confirmed Order', intent: ['Transport', 'Confirmed Order'], state: 'Processed', match: null, caseId: '325855',
    reason: 'New case created, clarification loop started', priority: 'High', mailbox: 'transport@aalogistik.se', attention: false,
    conf: 93, icon: 'truck', assignee: 'Malin Andersson',
    body: 'We have a shipment going out tomorrow morning from Ludvika.', extracted: ['2 pallets switchgear parts'], suggestion: 'No action required.'
  },
  {
    id: 'M8', date: '25 Sep 2026', time: '08:12', customer: 'ABB Robotics Sweden AB', sender: 'adrjan.gradenas@se.abb.com', subject: 'Transport request — 4 pallets Västerås → Stockholm (PO-44871)',
    ai: 'Transport + Warehouse + Packing / Confirmed Order', intent: ['Transport + Warehouse', '+ Packing / Confirmed Order'], state: 'Processed', match: null, caseId: '325854',
    reason: 'New case created after confirmation', priority: 'High', mailbox: 'transport@aalogistik.se', attention: false,
    conf: 96, icon: 'new', assignee: 'Malin Andersson',
    body: 'We need 4 pallets of robot components collected at Finnslätten today at 14:00.', extracted: ['4 pallets', 'Storage 2 days', 'Repack to export crates'], suggestion: 'No action required.'
  },
  {
    id: 'M9', date: '25 Sep 2026', time: '07:58', customer: 'ABB Oy', sender: 'annika.poikela@se.abb.com', subject: 'Packaging materials pickup next Tuesday',
    ai: 'Transport + Packing / Confirmed Order', intent: ['Transport + Packing', 'Confirmed Order'], state: 'Review Required', match: null, caseId: '325859',
    reason: 'Quantity and dimensions not stated — classification proposed but not confirmed', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true,
    conf: 78, icon: 'new', assignee: null,
    body: 'We would like a pickup of packaging materials at Hallstahammar next Tuesday.',
    extracted: ['Pickup: Hallstahammar', 'Repacking requested', 'Quantity: not stated'],
    suggestion: 'Confirm the classification to generate tasks, then ask the customer for quantity and dimensions.'
  },
  {
    id: 'M10', date: '25 Sep 2026', time: '07:40', customer: 'ABB Robotics Sweden AB', sender: 'ekonomi@abb.com', subject: 'Invoice query — March statement',
    ai: 'Finance / Other', intent: ['Finance', 'Other'], state: 'Processed', match: null, caseId: null,
    reason: 'Invoice question — forwarded to Finance, no operational case required', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: false,
    conf: 92, icon: 'finance', assignee: 'Finance',
    body: 'Question about invoice 2026-0331.', extracted: ['No transport request detected'], suggestion: 'No action required.'
  },
  {
    id: 'M11', date: '25 Sep 2026', time: '08:32', customer: '247 Logistics AB', sender: 'boka@247logistics.se', subject: 'Change delivery time for order 45821',
    ai: 'Transport / Change Request', intent: ['Transport', 'Change Request'], icon: 'truck', conf: 96, state: 'Existing Order Change', match: null, caseId: null, orderRef: '45821',
    reason: 'Opter order 45821 is referenced in the subject, but it is not linked to any case yet', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true, assignee: 'Andreas Backström',
    body: 'Hi,\n\nCould you move the delivery for order 45821 from 13:00 to 09:00 on Monday? The site opens earlier than planned.\n\nBest regards,\n247 Logistics Book, 247 Logistics AB',
    extracted: ['Opter order: 45821', 'Delivery time change: 13:00 → 09:00, Monday'], suggestion: 'Create a change case linked to Opter order 45821 and update the delivery time.'
  },
  {
    id: 'M12', date: '25 Sep 2026', time: '07:26', customer: 'NCC Sverige AB', sender: 'johan.karlsson@ncc.se', subject: 'Pickup order - Uppsala',
    ai: 'Transport / Confirmed Order', intent: ['New Transport', 'Order'], icon: 'new', conf: 92, state: 'Ready for Validation', match: null, caseId: null,
    reason: 'All required fields were extracted. A person validates them before the case and Opter order are created', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true, assignee: 'Malin Andersson',
    body: 'Hello,\n\nPlease collect 3 EUR pallets (120x80x110, 1 200 kg total) at Kungsgatan 44, Uppsala on Tuesday 08:00, delivery to our site in Västerås.\n\nJohan Karlsson, NCC',
    extracted: ['Pickup: Kungsgatan 44, Uppsala — Tue 08:00', 'Delivery: Västerås', '3 EUR pallets, 120×80×110, 1 200 kg'], suggestion: 'Validate the extracted data and create the case.'
  },
  {
    id: 'M13', date: '24 Sep 2026', time: '16:48', customer: 'Peab AB', sender: 'transport@peab.se', subject: 'Fwd: Bilagor - fraktsedel',
    ai: 'Transport / Inquiry', intent: ['Transport Inquiry', ''], icon: 'chat', conf: 88, state: 'Missing Information', match: null, caseId: null,
    reason: 'Waybill attached, but pickup date and goods dimensions are missing', priority: 'Low', mailbox: 'transport@aalogistik.se', attention: true, assignee: null,
    body: '---------- Forwarded message ----------\nHej, se bifogad fraktsedel. Kan ni ge pris?\n\n/Peab Transport',
    extracted: ['Attachment: Fraktsedel_Peab.pdf', 'Route: Enköping → Västerås', 'Pickup date: missing', 'Dimensions: missing'], suggestion: 'Create an inquiry case and ask the customer for pickup date and dimensions.'
  },
  {
    id: 'M14', date: '24 Sep 2026', time: '15:22', customer: 'Essity AB', sender: 'order@essity.com', subject: 'Orderbekräftelse och leveransinstruktioner',
    ai: 'Transport / Confirmed Order ×3', intent: ['Multiple Orders', ''], icon: 'multi', conf: 90, state: 'Review Required', match: null, caseId: null,
    reason: 'Three separate orders in one email — a person decides whether they become one case or three', priority: 'Normal', mailbox: 'transport@aalogistik.se', attention: true, assignee: null,
    body: 'Hej,\n\nHär kommer tre ordrar för vecka 40 med leveransinstruktioner för respektive mottagare.\n\nMvh\nEssity Order Desk',
    extracted: ['Order 1: Mölndal → Västerås', 'Order 2: Mölndal → Örebro', 'Order 3: Mölndal → Uppsala'], suggestion: 'Split into three cases, or keep as one case with three work items.'
  },
  {
    id: 'M15', date: '24 Sep 2026', time: '14:05', customer: 'Boliden AB', sender: 'logistik@boliden.com', subject: 'Reklamation - skadad pall',
    ai: 'Complaint / Deviation', intent: ['Complaint', ''], icon: 'complaint', conf: 87, state: 'Requires Investigation', match: null, caseId: null,
    reason: 'Damage reported on a delivered pallet — needs an investigation and a customer response', priority: 'Normal', mailbox: 'terminal@aalogistik.se', attention: true, assignee: 'Customer Service',
    body: 'Hej,\n\nEn pall i gårdagens leverans kom fram skadad. Bilder bifogade. Vi vill ha en reklamation registrerad.\n\nBoliden Logistik',
    extracted: ['Deviation: damaged pallet', '3 photos attached', 'No Opter reference found'], suggestion: 'Create a deviation case and find the original delivery.'
  }
];

export const MSG_FILES: Record<string, Array<[string, string, string, string]>> = {
  M4: [['TO_8841-B.pdf', '1.2 MB', 'PDF', 'Could not be read — scanned image, no text layer']],
  M7: [['Delivery_note_HE.pdf', '184 KB', 'PDF', 'Read by AI']],
  M8: [['Packing_list_ABB.pdf', '96 KB', 'PDF', 'Read by AI']],
  M10: [['Faktura_2026-0331.pdf', '72 KB', 'PDF', 'Read by AI']],
  M13: [['Fraktsedel_Peab.pdf', '210 KB', 'PDF', 'Read by AI']],
  M14: [['Order_1.pdf', '64 KB', 'PDF', 'Read by AI'], ['Order_2.pdf', '61 KB', 'PDF', 'Read by AI'], ['Order_3.pdf', '66 KB', 'PDF', 'Read by AI'], ['Leveransinstruktioner.docx', '38 KB', 'Word', 'Read by AI']],
  M15: [['IMG_4411.jpg', '2.1 MB', 'Image', 'Photo — not text'], ['IMG_4412.jpg', '2.0 MB', 'Image', 'Photo — not text'], ['IMG_4413.jpg', '2.2 MB', 'Image', 'Photo — not text']]
};

const OKF = 'High Confidence' as const;
const RVF = 'Review Recommended' as const;
const MSF = 'Missing' as const;

function mkCase(d: any): CaseItem {
  const tasks = d.tasks.map((x: any, i: number) => {
    const [title, dept, assignee, status, due, o] = x;
    const opt = o || {};
    return {
      id: 'T' + (i + 1),
      wi: 'wi-' + dept,
      title,
      dept,
      assignee,
      status,
      due,
      priority: opt.p || 'Normal',
      timing: opt.late ? 'Overdue' : opt.soon ? 'Due Soon' : 'On Track',
      overdueBy: opt.late || null,
      done: status === 'Done' ? opt.done || due : null,
      milestone: !!opt.ms,
      dep: opt.dep ? 'T' + opt.dep : undefined,
      origin: opt.origin,
      desc: opt.desc || '',
      readiness: 'Ready',
      waitingFor: opt.wait || null
    };
  });
  tasks.forEach((t: any) => {
    if (t.status === 'Done') return;
    const pre = t.dep && tasks.find((x: any) => x.id === t.dep);
    if (pre && pre.status !== 'Done') {
      t.readiness = 'Waiting for Task';
      t.waitingFor = pre.title;
    } else if (t.waitingFor) {
      t.readiness = /customer/i.test(t.waitingFor) ? 'Waiting for Customer' : 'Upcoming';
    }
  });
  const depts = Array.from(new Set(tasks.map((t: any) => t.dept))) as string[];
  const conv = d.conv.map(([type, who, time, subject, body, att]: any) =>
    type === 'internal'
      ? { type, from: who, time, body, attachments: [] }
      : type === 'in'
      ? { type, from: who, to: 'transport@aalogistik.se', time, subject, body, attachments: att || [] }
      : { type, from: 'transport@aalogistik.se', to: who, time, subject, body, attachments: att || [] }
  );
  const act: any[] = [];
  const first = conv[0];
  act.push({ time: first.time, actor: 'System', kind: 'Communication', text: 'Email received from ' + d.email, detail: 'Source mailbox: transport@aalogistik.se' });
  act.push({ time: first.time, actor: 'AI', kind: 'System', text: 'Message processed — ' + d.categories.join(' + ') + ' / ' + (d.firstClass || d.caseClass), detail: d.originNote || '' });
  act.push({ time: first.time, actor: d.createdBy || 'Malin Andersson', kind: 'System', text: 'Case created', detail: d.originNote || '' });
  act.push({ time: first.time, actor: 'System', kind: 'Tasks', text: tasks.length + ' tasks generated from templates', detail: d.categories.map((c: string) => c + ' + ' + (d.firstClass || d.caseClass)).join(', ') });
  (d.extraAct || []).forEach((a: any) => act.push({ time: a[0], actor: a[1], kind: a[2], text: a[3], detail: a[4] || '' }));
  conv.slice(1).forEach((m: any) =>
    act.push({
      time: m.time,
      actor: m.type === 'internal' ? m.from : m.type === 'out' ? 'Malin Andersson' : 'System',
      kind: 'Communication',
      text: m.type === 'in' ? 'Email received from ' + d.email : m.type === 'out' ? 'Email sent to ' + d.email : 'Internal note added',
      detail: m.subject || ''
    })
  );
  tasks
    .filter((t: any) => t.status === 'Done')
    .forEach((t: any) => act.push({ time: t.done, actor: t.assignee || 'System', kind: 'Tasks', text: 'Task "' + t.title + '" completed', detail: '' }));

  return {
    id: d.id,
    customer: d.customer,
    contact: d.contact,
    email: d.email,
    title: d.title,
    categories: d.categories,
    caseClass: d.caseClass,
    classification: d.classification || (d.caseClass === 'Confirmed Order' ? 'New Transport Order' : d.caseClass === 'Inquiry' ? 'Inquiry' : d.caseClass === 'Change Request' ? 'Order Change' : 'New Transport Order'),
    types: d.types || (d.categories.includes('Freight Forwarding') ? ['Freight Forwarding'] : d.categories.includes('Packing') && d.categories.includes('Warehouse') ? ['Warehouse', 'Packing'] : d.categories.includes('Warehouse') ? ['Warehouse'] : d.categories.includes('Packing') ? ['Packing'] : ['Standard Transport']),
    status: d.status,
    weight: d.weight || (d.data?.find((x: any) => String(x[0]).toLowerCase().includes('weight'))?.[1] || '2 400 kg'),
    items: d.items || [
      {
        id: 'item-1',
        name: d.title || 'Standard Cargo Consignment',
        weight: d.weight || (d.data?.find((x: any) => String(x[0]).toLowerCase().includes('weight'))?.[1] || '2 400 kg'),
        length: '120 cm',
        width: '80 cm',
        height: '135 cm',
        qty: 2,
        type: 'EUR Pallet',
        notes: 'Standard industrial packing'
      }
    ],
    priority: d.priority || 'Normal',
    lifecycle: d.lifecycle || 'Active',
    conditions: d.conditions || [],
    created: d.created,
    lastActivity: d.lastActivity,
    origin: d.origin || 'ai',
    originNote: d.originNote || '',
    scenario: d.scenario,
    comm: d.comm,
    summary: d.summary,
    workItems: depts.map((x: string) => ({ id: 'wi-' + x, name: x + ' work', dept: x })),
    tasks,
    data: [{ group: d.dataGroup || 'Transport — pickup and delivery', fields: d.data.map(([k, v, src, rev]: any) => ({ k, v, src, rev: rev || OKF })) }],
    records: (d.records || []).map(([type, number, created, status]: any) => ({ type, number, created, status, wi: type === 'WMS reference' ? 'Warehouse work' : 'Transport work' })),
    conversation: conv,
    activity: act,
    accepted: d.accepted
  };
}

export const MORE_CASES_DATA = [
  {
    id: '325848', scenario: 'Transport only', customer: '247 Logistics AB', contact: '247 Logistics Book', email: 'boka@247logistics.se',
    title: 'Transformer parts Västerås → Forsmark', categories: ['Transport'], caseClass: 'Confirmed Order', priority: 'High',
    created: '24 Sep 13:05', lastActivity: '40 min ago', originNote: 'AI proposal confirmed by Malin Andersson',
    comm: { state: 'Acknowledged', lastIn: '24 Sep 13:05', lastOut: '24 Sep 15:20', waiting: null },
    summary: 'Pickup of 3 crates of transformer parts at the Västerås terminal for delivery to Forsmark tomorrow. Order confirmed; pickup is being arranged. Pricing can start because the Opter order exists.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', '24 Sep 14:00', { p: 'High', done: '24 Sep 13:40' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '24 Sep 15:00', { p: 'High', dep: 1, done: '24 Sep 14:55' }],
      ['Confirm order to customer', 'Transport', 'Malin Andersson', 'Done', '24 Sep 16:00', { dep: 2, ms: true, done: '24 Sep 15:20' }],
      ['Arrange pickup in Västerås', 'Transport', 'Andreas Backström', 'In Progress', 'Today 13:00', { p: 'High', dep: 2 }],
      ['Deliver to Forsmark', 'Transport', null, 'To Do', 'Fri 26 Sep 10:00', { dep: 4, ms: true }],
      ['Prepare pricing and invoice basis', 'Finance', null, 'To Do', 'Today 16:00', { dep: 2, origin: 'ai' }],
      ['Send invoice', 'Finance', null, 'To Do', 'Mon 29 Sep 12:00', { dep: 5 }]
    ],
    data: [
      ['Customer', '247 Logistics AB', 'Sender domain + customer master'],
      ['Pickup location', 'AA Logistik terminal, Västerås', 'Email body, line 2'],
      ['Delivery location', 'Forsmark power plant, gate 3', 'Email body, line 3'],
      ['Items', '3 crates, transformer parts', 'Delivery_spec_VF.pdf'],
      ['Dimensions', '160 × 110 × 120 cm', 'Delivery_spec_VF.pdf'],
      ['Pallets', '3 (crates)', 'Delivery_spec_VF.pdf'],
      ['Total weight', '2 950 kg', 'Delivery_spec_VF.pdf'],
      ['Customer reference', 'VF-PO-99812', 'Email subject']
    ],
    records: [['Opter order', '246355', '24 Sep 14:55', 'Planned']],
    conv: [
      ['in', '247 Logistics Book <boka@247logistics.se>', '24 Sep 13:05', 'Transport Västerås → Forsmark (VF-PO-99812)', 'Hello,\n\nPlease collect 3 crates of transformer parts at your Västerås terminal and deliver to Forsmark, gate 3, on Friday morning.\n\nSpecification attached.\n\n247 Logistics Book, 247 Logistics AB', ['Delivery_spec_VF.pdf']],
      ['out', 'boka@247logistics.se', '24 Sep 15:20', 'Order confirmation — VF-PO-99812', 'Hello Sara,\n\nYour transport is booked with reference 246355. Delivery to Forsmark gate 3 on Friday morning.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['internal', 'Andreas Backström', 'Today 09:40', 'Forsmark needs the driver ID 24 h in advance — sending it with the pickup confirmation.']
    ]
  },
  {
    id: '325851', scenario: 'Transport only', customer: 'Essity AB', contact: 'Order Desk', email: 'order@essity.com',
    title: 'Pallet transport Mölndal → Västerås', categories: ['Transport'], caseClass: 'Confirmed Order', lifecycle: 'Completed',
    created: '22 Sep 08:30', lastActivity: 'Yesterday 11:05', origin: 'rule', originNote: 'Customer rule: recurring Essity lane',
    comm: { state: 'No Action Required', lastIn: '22 Sep 08:30', lastOut: 'Yesterday 11:05', waiting: null },
    summary: 'Eight pallets from Mölndal to Västerås, delivered on time yesterday. Completion update sent and invoice issued.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', '22 Sep 10:00', { done: '22 Sep 09:10' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '22 Sep 12:00', { dep: 1, done: '22 Sep 10:02' }],
      ['Confirm order to customer', 'Transport', 'Malin Andersson', 'Done', '22 Sep 12:00', { dep: 2, ms: true, done: '22 Sep 10:15' }],
      ['Arrange pickup', 'Transport', 'Andreas Backström', 'Done', '23 Sep 08:00', { dep: 2, done: '23 Sep 07:40' }],
      ['Deliver to Västerås', 'Transport', 'Andreas Backström', 'Done', 'Yesterday 10:00', { dep: 4, ms: true, done: 'Yesterday 09:35' }],
      ['Send completion update', 'Transport', 'Malin Andersson', 'Done', 'Yesterday 12:00', { dep: 5, ms: true, done: 'Yesterday 11:05' }],
      ['Send invoice', 'Finance', null, 'Done', 'Yesterday 16:00', { dep: 5, done: 'Yesterday 15:30' }]
    ],
    data: [
      ['Customer', 'Essity AB', 'Sender domain + customer master'],
      ['Pickup location', 'Essity, Mölndal', 'Email body, line 2'],
      ['Delivery location', 'Essity DC, Västerås', 'Customer master — default address'],
      ['Items', '8 pallets, hygiene products', 'Email body, line 2'],
      ['Dimensions', '120 × 80 × 150 cm', 'Email body, line 3'],
      ['Pallets', '8 (EUR)', 'Email body, line 2']
    ],
    records: [['Opter order', '246301', '22 Sep 10:02', 'Delivered']],
    conv: [
      ['in', 'Essity Order Desk <order@essity.com>', '22 Sep 08:30', 'Order 55120 — 8 pallets to Västerås', 'Hej,\n\n8 EUR pallets, 120x80x150, from Mölndal to our Västerås DC, pickup Tuesday.\n\nEssity Order Desk'],
      ['out', 'order@essity.com', '22 Sep 10:15', 'Order confirmation — 55120', 'Hello,\n\nBooked under 246301. Pickup Tuesday in Mölndal, delivery Wednesday.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['out', 'order@essity.com', 'Yesterday 11:05', 'Delivered — 55120', 'Hello,\n\nAll 8 pallets were delivered to Västerås at 09:35. POD attached.\n\nKind regards,\nMalin Andersson, AA Logistik', ['POD_246301.pdf']]
    ]
  },
  {
    id: '325852', scenario: 'Transport only', customer: 'Peab AB', contact: 'Transport desk', email: 'transport@peab.se',
    title: 'Construction materials Enköping → Uppsala tomorrow', categories: ['Transport'], caseClass: 'Confirmed Order', priority: 'Urgent', conditions: ['At Risk'],
    created: 'Today 07:05', lastActivity: '15 min ago', originNote: 'Created automatically — AI confidence 93%',
    comm: { state: 'Acknowledged', lastIn: 'Today 07:05', lastOut: 'Today 07:30', waiting: null },
    summary: 'Urgent delivery of 6 bundles to an Uppsala site tomorrow 07:00. No carrier is booked yet and the booking task is more than an hour overdue.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', 'Today 08:00', { p: 'Urgent', done: 'Today 07:25' }],
      ['Create Opter order', 'Transport', 'Malin Andersson', 'Done', 'Today 09:00', { p: 'Urgent', dep: 1, done: 'Today 08:10' }],
      ['Book carrier slot', 'Transport', 'Andreas Backström', 'To Do', 'Today 10:30', { p: 'Urgent', dep: 2, late: '1 h 10 min' }],
      ['Confirm pickup time to customer', 'Transport', null, 'To Do', 'Today 12:00', { p: 'High', dep: 3, ms: true }],
      ['Arrange crane at delivery site', 'Transport', null, 'To Do', 'Today 15:00', { origin: 'manual' }]
    ],
    data: [
      ['Customer', 'Peab AB', 'Sender domain + customer master'],
      ['Pickup location', 'Peab depot, Enköping', 'Email body, line 2'],
      ['Delivery location', 'Site Rosendal, Uppsala', 'Email body, line 3'],
      ['Items', '6 bundles, reinforcement steel', 'Email body, line 2'],
      ['Total weight', '4 200 kg', 'Email body, line 4'],
      ['Delivery time', 'Tomorrow 07:00', 'Email body, line 3']
    ],
    records: [['Opter order', '246410', 'Today 08:10', 'Awaiting carrier']],
    conv: [
      ['in', 'Peab Transport <transport@peab.se>', 'Today 07:05', 'Leverans imorgon 07:00 — Rosendal', 'Hej,\n\n6 buntar armering från Enköping till Rosendal, Uppsala, imorgon kl 07:00. Ca 4 200 kg.\n\nPeab Transport'],
      ['out', 'transport@peab.se', 'Today 07:30', 'Received — delivery Rosendal tomorrow', 'Hello,\n\nWe have your order and are booking the transport now. We will confirm the pickup time before noon.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325846', scenario: 'Transport + Warehouse + Packing', customer: 'ABB Switzerland AG', contact: 'Abdela Zildzic Mehmedovic', email: 'logistics.tillberga@abb.com',
    title: 'Switchgear: collect, store 5 days, export crates, ship to Göteborg', categories: ['Transport', 'Warehouse', 'Packing'], caseClass: 'Confirmed Order', priority: 'High',
    created: '22 Sep 10:20', lastActivity: '1 h ago', originNote: 'AI proposal confirmed by Malin Andersson',
    comm: { state: 'Acknowledged', lastIn: '22 Sep 10:20', lastOut: 'Yesterday 14:10', waiting: null },
    summary: 'Six switchgear units collected in Ludvika and stored at the terminal. Export crating is in progress; shipment to Göteborg port follows once crating is done.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', '22 Sep 12:00', { done: '22 Sep 11:05' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '22 Sep 14:00', { dep: 1, done: '22 Sep 13:30' }],
      ['Pickup in Ludvika', 'Transport', 'Andreas Backström', 'Done', '23 Sep 10:00', { dep: 2, done: '23 Sep 09:40' }],
      ['Receive 6 units', 'Warehouse', 'Anna Svensson', 'Done', '23 Sep 15:00', { dep: 3, done: '23 Sep 14:20' }],
      ['Register in WMS', 'Warehouse', 'Anna Svensson', 'Done', '23 Sep 17:00', { dep: 4, done: '23 Sep 15:05' }],
      ['Build export crates', 'Packing', 'Erik Nilsson', 'In Progress', 'Today 16:00', { p: 'High', dep: 4 }],
      ['Deliver to Göteborg Hamn', 'Transport', null, 'To Do', 'Mon 29 Sep 08:00', { dep: 6, ms: true }],
      ['Prepare pricing and invoice basis', 'Finance', null, 'To Do', 'Today 17:00', { dep: 2, origin: 'ai' }],
      ['Order crate materials', 'Packing', 'Erik Nilsson', 'Done', 'Yesterday 10:00', { origin: 'ai', done: 'Yesterday 09:15' }]
    ],
    data: [
      ['Customer', 'ABB Switzerland AG', 'Sender domain + customer master'],
      ['Pickup location', 'Ludvika, Kabelvägen 3', 'Email body, line 2'],
      ['Delivery location', 'Göteborg Hamn, Skandiahamnen', 'Booking_HE_0922.pdf'],
      ['Items', '6 switchgear units', 'Booking_HE_0922.pdf'],
      ['Dimensions', '210 × 90 × 180 cm', 'Booking_HE_0922.pdf'],
      ['Storage period', '5 days', 'Email body, line 4'],
      ['Repack specification', 'Export crates, ISPM-15', 'Email body, line 5'],
      ['Total weight', '9 600 kg', 'Booking_HE_0922.pdf']
    ],
    records: [['Opter order', '246322', '22 Sep 13:30', 'In storage'], ['WMS reference', 'WH-8830', '23 Sep 15:05', 'Stored']],
    conv: [
      ['in', 'Abdela Zildzic Mehmedovic <logistics.tillberga@abb.com>', '22 Sep 10:20', '6 switchgear units — storage and export crating', 'Hi,\n\nPlease collect 6 units in Ludvika on Tuesday, store them 5 days, build ISPM-15 export crates and deliver to Skandiahamnen on Monday.\n\nBooking attached.\n\nPer', ['Booking_HE_0922.pdf']],
      ['out', 'logistics.tillberga@abb.com', '22 Sep 14:00', 'Order confirmation — 246322', 'Hello Per,\n\nConfirmed under 246322: pickup Tuesday, storage at Västerås, export crating, delivery Monday.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['out', 'logistics.tillberga@abb.com', 'Yesterday 14:10', 'Goods received and stored', 'Hello Per,\n\nAll 6 units are received and stored under WH-8830. Crating starts today.\n\nKind regards,\nAnna Svensson, AA Logistik'],
      ['internal', 'Erik Nilsson', 'Today 10:05', 'Crates 1–4 done. Two units need extra bracing — finishing this afternoon.']
    ]
  },
  {
    id: '325850', scenario: 'Transport + Warehouse + Packing', customer: 'ALSTOM Rail Sweden AB', contact: 'Jonas Ek', email: 'jonas.ek@alstom.com',
    title: 'Spare parts: consolidate, repack and deliver to Nyköping', categories: ['Transport', 'Warehouse', 'Packing'], caseClass: 'Confirmed Order',
    conditions: ['Missing Information', 'Waiting for Customer'], created: 'Yesterday 13:40', lastActivity: '2 h ago', originNote: 'AI proposal confirmed by Malin Andersson',
    comm: { state: 'Waiting for Customer', lastIn: 'Yesterday 13:40', lastOut: 'Today 09:30', waiting: '2 h 10 min' },
    summary: 'Three inbound deliveries to consolidate at the terminal, repack and deliver to Nyköping. Receiving can start, but the repack specification is missing — we asked the customer this morning.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', 'Yesterday 16:00', { done: 'Yesterday 15:10' }],
      ['Request repack specification', 'Transport', 'Malin Andersson', 'Done', 'Today 10:00', { origin: 'ai', ms: true, done: 'Today 09:30' }],
      ['Receive 3 inbound deliveries', 'Warehouse', 'Anna Svensson', 'To Do', 'Today 15:00'],
      ['Consolidate in WMS', 'Warehouse', 'Anna Svensson', 'To Do', 'Tomorrow 10:00', { dep: 3 }],
      ['Repack to customer specification', 'Packing', null, 'To Do', 'Tomorrow 14:00', { dep: 4, wait: 'Repack specification from customer' }],
      ['Create Opter order', 'Transport', null, 'To Do', 'Tomorrow 12:00', { dep: 1, wait: 'Customer reply with repack spec' }],
      ['Deliver to Nyköping', 'Transport', null, 'To Do', 'Mon 29 Sep 10:00', { dep: 5, ms: true }]
    ],
    data: [
      ['Customer', 'ALSTOM Rail Sweden AB', 'Sender domain + customer master'],
      ['Pickup location', 'AA Logistik terminal, Västerås (consolidated)', 'Email body, line 2'],
      ['Delivery location', 'ALSTOM Rail Sweden AB, Industrigatan 12, Nyköping', 'Customer master — default address'],
      ['Items', '3 inbound deliveries, spare parts', 'Email body, line 3'],
      ['Repack specification', '', 'Not found in email or attachment', MSF],
      ['Pallets', '', 'Not found in email or attachment', MSF]
    ],
    records: [],
    conv: [
      ['in', 'Jonas Ek <jonas.ek@alstom.com>', 'Yesterday 13:40', 'Consolidation — 3 suppliers → Nyköping', 'Hi,\n\nThree suppliers deliver to your terminal this week. Please consolidate, repack and deliver everything to Nyköping on Monday.\n\nJonas'],
      ['out', 'jonas.ek@alstom.com', 'Today 09:30', 'Repack specification needed', 'Hello Jonas,\n\nWe can start receiving today. To repack, please send the packing specification and the number of pallets you expect.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325843', scenario: 'Transport + Warehouse + Packing', customer: 'ABB Robotics Sweden AB', contact: 'Adrian Gradenas', email: 'adrjan.gradenas@se.abb.com',
    title: 'Robot arms: store, crate and deliver to Gävle', categories: ['Transport', 'Warehouse', 'Packing'], caseClass: 'Confirmed Order', lifecycle: 'Completed',
    created: '18 Sep 09:00', lastActivity: '23 Sep 16:20', originNote: 'AI proposal confirmed by Malin Andersson',
    comm: { state: 'No Action Required', lastIn: '18 Sep 09:00', lastOut: '23 Sep 16:20', waiting: null },
    summary: 'Two robot arms stored for three days, crated and delivered to Gävle on 23 Sep. Customer informed and invoiced.',
    tasks: [
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', '18 Sep 11:00', { done: '18 Sep 09:40' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '18 Sep 13:00', { dep: 1, done: '18 Sep 10:30' }],
      ['Receive goods', 'Warehouse', 'Anna Svensson', 'Done', '19 Sep 14:00', { dep: 2, done: '19 Sep 13:10' }],
      ['Crate robot arms', 'Packing', 'Erik Nilsson', 'Done', '22 Sep 12:00', { dep: 3, done: '22 Sep 11:30' }],
      ['Deliver to Gävle', 'Transport', 'Andreas Backström', 'Done', '23 Sep 14:00', { dep: 4, ms: true, done: '23 Sep 13:45' }],
      ['Send completion update', 'Transport', 'Malin Andersson', 'Done', '23 Sep 17:00', { dep: 5, ms: true, done: '23 Sep 16:20' }],
      ['Send invoice', 'Finance', null, 'Done', '24 Sep 12:00', { dep: 5, done: '24 Sep 10:00' }]
    ],
    data: [
      ['Customer', 'ABB Robotics Sweden AB', 'Sender domain + customer master'],
      ['Pickup location', 'Finnslätten, Västerås', 'Email body, line 2'],
      ['Delivery location', 'ABB Service, Gävle', 'Email body, line 3'],
      ['Items', '2 robot arms', 'Email body, line 2'],
      ['Storage period', '3 days', 'Email body, line 4'],
      ['Customer reference', 'PO-44790', 'Email subject']
    ],
    records: [['Opter order', '246270', '18 Sep 10:30', 'Delivered'], ['WMS reference', 'WH-8790', '19 Sep 13:10', 'Shipped']],
    conv: [
      ['in', 'Adrian Gradenas <adrjan.gradenas@se.abb.com>', '18 Sep 09:00', 'Robot arms to Gävle (PO-44790)', 'Hello,\n\nTwo robot arms to collect at Finnslätten, store three days, crate and deliver to our Gävle service centre.\n\nAnna'],
      ['out', 'adrjan.gradenas@se.abb.com', '18 Sep 10:40', 'Order confirmation — PO-44790', 'Hello Anna,\n\nBooked under 246270.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['out', 'adrjan.gradenas@se.abb.com', '23 Sep 16:20', 'Delivered — PO-44790', 'Hello Anna,\n\nBoth robot arms were delivered to Gävle at 13:45.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325849', scenario: 'Price request', customer: 'NCC Sverige AB', contact: 'Johan Karlsson', email: 'johan.karlsson@ncc.se',
    title: 'Price for weekly 12 pallets Uppsala → Stockholm', categories: ['Transport'], caseClass: 'Inquiry',
    created: 'Yesterday 15:30', lastActivity: '50 min ago', origin: 'ai', originNote: 'AI classified as price request',
    comm: { state: 'Acknowledged', lastIn: 'Yesterday 15:30', lastOut: 'Yesterday 16:00', waiting: null },
    summary: 'NCC asks for a price on a weekly shuttle of 12 pallets Uppsala → Stockholm from week 41. Pricing input is being collected; the quote is due today.',
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', 'Yesterday 17:00', { done: 'Yesterday 15:55' }],
      ['Obtain pricing and operational input', 'Transport', 'Andreas Backström', 'In Progress', 'Today 12:00', { dep: 1, soon: true }],
      ['Check capacity for week 41', 'Transport', 'Andreas Backström', 'Done', 'Today 10:00', { origin: 'ai', done: 'Today 09:20' }],
      ['Prepare response', 'Transport', 'Malin Andersson', 'To Do', 'Today 15:00', { dep: 2 }],
      ['Send quote', 'Transport', 'Malin Andersson', 'To Do', 'Today 17:00', { dep: 4, ms: true }]
    ],
    dataGroup: 'Inquiry',
    data: [
      ['Customer', 'NCC Sverige AB', 'Sender domain + customer master'],
      ['Pickup location', 'Uppsala', 'Email body, line 2'],
      ['Delivery location', 'Stockholm', 'Email body, line 2'],
      ['Items', '12 pallets per week', 'Email body, line 2'],
      ['Requested start', 'Week 41', 'Email body, line 3']
    ],
    conv: [
      ['in', 'Johan Karlsson <johan.karlsson@ncc.se>', 'Yesterday 15:30', 'Prisförfrågan — veckoshuttle', 'Hej,\n\nVi behöver pris på 12 pallar i veckan Uppsala → Stockholm, start vecka 41.\n\nJohan'],
      ['out', 'johan.karlsson@ncc.se', 'Yesterday 16:00', 'Received — price request', 'Hello Johan,\n\nThank you — we will send you a quote by tomorrow afternoon.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325847', scenario: 'Price request', customer: 'Boliden AB', contact: 'Logistik', email: 'logistik@boliden.com',
    title: 'Quote: bulk bags Skellefteå → Västerås', categories: ['Transport'], caseClass: 'Inquiry', conditions: ['Waiting for Customer'],
    created: '22 Sep 11:15', lastActivity: 'Yesterday 09:00', origin: 'rule', originNote: 'Inquiry rule: price request from a known customer',
    comm: { state: 'Waiting for Customer', lastIn: '22 Sep 11:15', lastOut: '23 Sep 14:30', waiting: '2 days' },
    summary: 'Quote for 20 bulk bags Skellefteå → Västerås sent on 23 Sep (18 400 SEK). No answer yet; the follow-up is overdue.',
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', '22 Sep 13:00', { done: '22 Sep 11:50' }],
      ['Obtain pricing and operational input', 'Transport', 'Andreas Backström', 'Done', '23 Sep 12:00', { dep: 1, done: '23 Sep 11:10' }],
      ['Prepare response', 'Transport', 'Malin Andersson', 'Done', '23 Sep 14:00', { dep: 2, done: '23 Sep 14:00' }],
      ['Send quote', 'Transport', 'Malin Andersson', 'Done', '23 Sep 15:00', { dep: 3, ms: true, done: '23 Sep 14:30' }],
      ['Follow up on quote', 'Transport', 'Malin Andersson', 'To Do', 'Today 09:00', { dep: 4, late: '2 h 45 min' }]
    ],
    dataGroup: 'Inquiry',
    data: [
      ['Customer', 'Boliden AB', 'Sender domain + customer master'],
      ['Pickup location', 'Skellefteå', 'Email body, line 2'],
      ['Delivery location', 'Västerås', 'Email body, line 2'],
      ['Items', '20 bulk bags', 'Email body, line 3'],
      ['Quoted price', '18 400 SEK', 'Manually entered by Andreas Backström']
    ],
    conv: [
      ['in', 'Boliden Logistik <logistik@boliden.com>', '22 Sep 11:15', 'Offert — storsäckar', 'Hej,\n\nKan ni lämna pris på 20 storsäckar Skellefteå → Västerås under oktober?\n\nBoliden Logistik'],
      ['out', 'logistik@boliden.com', '23 Sep 14:30', 'Quote — Skellefteå → Västerås', 'Hello,\n\nOur price for 20 bulk bags Skellefteå → Västerås in October is 18 400 SEK excluding VAT. The quote is valid for 14 days.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325844', scenario: 'Price request', customer: '247 Logistics AB', contact: '247 Logistics Book', email: 'boka@247logistics.se',
    title: 'Quote: cable drums Ludvika → Ringhals', categories: ['Transport'], caseClass: 'Inquiry', lifecycle: 'Cancelled',
    created: '17 Sep 10:00', lastActivity: '22 Sep 09:10', origin: 'ai', originNote: 'AI classified as price request',
    comm: { state: 'No Action Required', lastIn: '22 Sep 09:10', lastOut: '18 Sep 11:00', waiting: null },
    summary: 'Quote for 4 cable drums sent on 18 Sep. The customer chose another carrier on 22 Sep; the case was closed as lost.',
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', '17 Sep 12:00', { done: '17 Sep 10:30' }],
      ['Obtain pricing and operational input', 'Transport', 'Andreas Backström', 'Done', '17 Sep 16:00', { dep: 1, done: '17 Sep 15:00' }],
      ['Prepare response', 'Transport', 'Malin Andersson', 'Done', '18 Sep 10:00', { dep: 2, done: '18 Sep 10:40' }],
      ['Send quote', 'Transport', 'Malin Andersson', 'Done', '18 Sep 12:00', { dep: 3, ms: true, done: '18 Sep 11:00' }],
      ['Record lost reason', 'Transport', 'Malin Andersson', 'Done', '22 Sep 12:00', { origin: 'manual', done: '22 Sep 09:20' }]
    ],
    dataGroup: 'Inquiry',
    data: [
      ['Customer', '247 Logistics AB', 'Sender domain + customer master'],
      ['Pickup location', 'Ludvika', 'Email body, line 2'],
      ['Delivery location', 'Ringhals', 'Email body, line 2'],
      ['Items', '4 cable drums', 'Email body, line 2'],
      ['Quoted price', '27 900 SEK', 'Manually entered by Andreas Backström']
    ],
    conv: [
      ['in', '247 Logistics Book <boka@247logistics.se>', '17 Sep 10:00', 'Price request — cable drums', 'Hello,\n\nWhat would 4 cable drums Ludvika → Ringhals cost next month?\n\nSara'],
      ['out', 'boka@247logistics.se', '18 Sep 11:00', 'Quote — cable drums', 'Hello Sara,\n\nOur price is 27 900 SEK excluding VAT, valid 14 days.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['in', '247 Logistics Book <boka@247logistics.se>', '22 Sep 09:10', 'Re: Quote — cable drums', 'Hello,\n\nThanks — we went with another carrier this time.\n\nSara']
    ]
  },
  {
    id: '325845', scenario: 'Inquiry → Order', customer: 'Essity AB', contact: 'Order Desk', email: 'order@essity.com', firstClass: 'Inquiry',
    title: 'Weekly shuttle Mölndal → Västerås (quote accepted)', categories: ['Transport'], caseClass: 'Confirmed Order', priority: 'High',
    created: '19 Sep 14:00', lastActivity: '30 min ago', origin: 'ai', originNote: 'Started as price request · converted to order on 23 Sep',
    comm: { state: 'Acknowledged', lastIn: '23 Sep 10:15', lastOut: '23 Sep 11:00', waiting: null },
    summary: 'Started as a price request for a weekly shuttle. Essity accepted the quote on 23 Sep and the same case continued as a confirmed order. The first run is booked; pickup confirmation to the customer is in progress.',
    extraAct: [
      ['23 Sep 10:15', 'AI', 'System', 'Acceptance detected — conversion to Confirmed Order suggested', ''],
      ['23 Sep 10:30', 'Malin Andersson', 'System', 'Case class changed', 'Inquiry → Confirmed Order']
    ],
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', '19 Sep 16:00', { done: '19 Sep 14:40' }],
      ['Obtain pricing and operational input', 'Transport', 'Andreas Backström', 'Done', '20 Sep 12:00', { dep: 1, done: '20 Sep 11:00' }],
      ['Send quote', 'Transport', 'Malin Andersson', 'Done', '20 Sep 15:00', { dep: 2, ms: true, done: '20 Sep 14:10' }],
      ['Validate transport details', 'Transport', 'Malin Andersson', 'Done', '23 Sep 12:00', { dep: 3, done: '23 Sep 10:50' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '23 Sep 14:00', { dep: 4, done: '23 Sep 13:20' }],
      ['Confirm order to customer', 'Transport', 'Malin Andersson', 'Done', '23 Sep 15:00', { dep: 5, ms: true, done: '23 Sep 11:00' }],
      ['Send pickup confirmation to customer', 'Transport', 'Malin Andersson', 'In Progress', 'Today 14:00', { dep: 5, origin: 'ai' }],
      ['Prepare pricing and invoice basis', 'Finance', null, 'To Do', 'Tomorrow 12:00', { dep: 5, origin: 'ai' }]
    ],
    data: [
      ['Customer', 'Essity AB', 'Sender domain + customer master'],
      ['Pickup location', 'Essity, Mölndal', 'Email body, line 2'],
      ['Delivery location', 'Essity DC, Västerås', 'Customer master — default address'],
      ['Items', 'Up to 24 pallets per week', 'Email body, line 3'],
      ['Dimensions', '120 × 80 × 150 cm', 'Acceptance email, line 3'],
      ['Pallets', '24 (EUR)', 'Acceptance email, line 3'],
      ['Agreed price', '9 800 SEK per run', 'Manually entered by Andreas Backström']
    ],
    records: [['Opter order', '246340', '23 Sep 13:20', 'Planned']],
    conv: [
      ['in', 'Essity Order Desk <order@essity.com>', '19 Sep 14:00', 'Pris — veckoshuttle Mölndal → Västerås', 'Hej,\n\nVad kostar en veckoshuttle med upp till 24 pallar Mölndal → Västerås?\n\nEssity Order Desk'],
      ['out', 'order@essity.com', '20 Sep 14:10', 'Quote — weekly shuttle', 'Hello,\n\n9 800 SEK per run excluding VAT, up to 24 EUR pallets. Valid 14 days.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['in', 'Essity Order Desk <order@essity.com>', '23 Sep 10:15', 'Re: Quote — weekly shuttle', 'Hej,\n\nVi accepterar. Första körningen fredag, 24 pallar 120x80x150.\n\nEssity Order Desk'],
      ['out', 'order@essity.com', '23 Sep 11:00', 'Order confirmation — weekly shuttle', 'Hello,\n\nThank you — first run Friday is booked under 246340.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325853', scenario: 'Inquiry → Order', customer: 'Peab AB', contact: 'Transport desk', email: 'transport@peab.se', firstClass: 'Inquiry',
    title: 'Crane parts Enköping → Västerås (quote accepted today)', categories: ['Transport'], caseClass: 'Confirmed Order', priority: 'High',
    conditions: ['Missing Information', 'Waiting for Customer'], created: '23 Sep 09:30', lastActivity: '25 min ago', origin: 'ai', originNote: 'Started as price request · converted to order today',
    comm: { state: 'Waiting for Customer', lastIn: 'Today 09:50', lastOut: 'Today 10:30', waiting: '1 h 15 min' },
    summary: 'Peab accepted our quote this morning and the case was converted to an order. A confirmed order needs dimensions and pallet count, which the inquiry did not have — we asked for them at 10:30.',
    extraAct: [
      ['Today 09:50', 'AI', 'System', 'Acceptance detected — conversion to Confirmed Order suggested', ''],
      ['Today 10:05', 'Malin Andersson', 'System', 'Case class changed', 'Inquiry → Confirmed Order'],
      ['Today 10:05', 'System', 'Data', 'Required data profile re-evaluated', '2 fields now required: Dimensions, Pallets']
    ],
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', '23 Sep 12:00', { done: '23 Sep 10:10' }],
      ['Obtain pricing and operational input', 'Transport', 'Andreas Backström', 'Done', '23 Sep 16:00', { dep: 1, done: '23 Sep 15:00' }],
      ['Send quote', 'Transport', 'Malin Andersson', 'Done', 'Yesterday 10:00', { dep: 2, ms: true, done: 'Yesterday 09:30' }],
      ['Request dimensions and pallet count', 'Transport', 'Malin Andersson', 'Done', 'Today 11:00', { origin: 'ai', ms: true, done: 'Today 10:30' }],
      ['Validate transport details', 'Transport', 'Malin Andersson', 'In Progress', 'Today 14:00', { dep: 3, p: 'High' }],
      ['Create Opter order', 'Transport', null, 'To Do', 'Today 16:00', { dep: 5, p: 'High' }],
      ['Confirm order to customer', 'Transport', null, 'To Do', 'Today 17:00', { dep: 6, ms: true }]
    ],
    data: [
      ['Customer', 'Peab AB', 'Sender domain + customer master'],
      ['Pickup location', 'Peab depot, Enköping', 'Email body, line 2'],
      ['Delivery location', 'AA Logistik terminal, Västerås', 'Email body, line 2'],
      ['Items', 'Crane parts', 'Email body, line 2'],
      ['Quoted price', '6 200 SEK', 'Manually entered by Andreas Backström'],
      ['Dimensions', '', 'Not provided in the inquiry', MSF],
      ['Pallets', '', 'Not provided in the inquiry', MSF]
    ],
    conv: [
      ['in', 'Peab Transport <transport@peab.se>', '23 Sep 09:30', 'Pris — kranutrustning', 'Hej,\n\nPris för kranutrustning Enköping → Västerås nästa vecka?\n\nPeab'],
      ['out', 'transport@peab.se', 'Yesterday 09:30', 'Quote — crane parts', 'Hello,\n\n6 200 SEK excluding VAT, valid 14 days.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['in', 'Peab Transport <transport@peab.se>', 'Today 09:50', 'Re: Quote — crane parts', 'Hej,\n\nVi kör på det. Hämtning tisdag.\n\nPeab'],
      ['out', 'transport@peab.se', 'Today 10:30', 'Dimensions and pallet count needed', 'Hello,\n\nThank you for the order! To book it, please send the dimensions and the number of pallets.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  },
  {
    id: '325842', scenario: 'Inquiry → Order', customer: 'ABB Oy', contact: 'Annika Poikela', email: 'annika.poikela@se.abb.com', firstClass: 'Inquiry',
    title: 'Packaging to Eskilstuna (quote → order → delivered)', categories: ['Transport'], caseClass: 'Confirmed Order', lifecycle: 'Completed',
    created: '15 Sep 10:00', lastActivity: '22 Sep 15:00', origin: 'rule', originNote: 'Started as price request · converted to order on 17 Sep',
    comm: { state: 'No Action Required', lastIn: '17 Sep 08:40', lastOut: '22 Sep 15:00', waiting: null },
    summary: 'Price request on 15 Sep, quote accepted on 17 Sep, delivered to Eskilstuna on 22 Sep. Closed and invoiced.',
    extraAct: [['17 Sep 09:00', 'Malin Andersson', 'System', 'Case class changed', 'Inquiry → Confirmed Order']],
    tasks: [
      ['Review inquiry', 'Transport', 'Malin Andersson', 'Done', '15 Sep 12:00', { done: '15 Sep 10:30' }],
      ['Send quote', 'Transport', 'Malin Andersson', 'Done', '15 Sep 17:00', { dep: 1, ms: true, done: '15 Sep 16:00' }],
      ['Create Opter order', 'Transport', 'Andreas Backström', 'Done', '17 Sep 12:00', { dep: 2, done: '17 Sep 10:10' }],
      ['Deliver to Eskilstuna', 'Transport', 'Andreas Backström', 'Done', '22 Sep 12:00', { dep: 3, ms: true, done: '22 Sep 11:20' }],
      ['Send invoice', 'Finance', null, 'Done', '22 Sep 16:00', { dep: 4, done: '22 Sep 15:00' }]
    ],
    data: [
      ['Customer', 'ABB Oy', 'Sender domain + customer master'],
      ['Pickup location', 'ABB Oy, Hallstahammar', 'Email body, line 2'],
      ['Delivery location', 'Eskilstuna', 'Email body, line 2'],
      ['Items', '10 pallets, packaging', 'Email body, line 2'],
      ['Pallets', '10 (EUR)', 'Acceptance email'],
      ['Dimensions', '120 × 80 × 120 cm', 'Acceptance email']
    ],
    records: [['Opter order', '246215', '17 Sep 10:10', 'Delivered']],
    conv: [
      ['in', 'Annika Poikela <annika.poikela@se.abb.com>', '15 Sep 10:00', 'Price — Hallstahammar → Eskilstuna', 'Hello,\n\nPrice for 10 pallets of packaging to Eskilstuna next week?\n\nKarin'],
      ['out', 'annika.poikela@se.abb.com', '15 Sep 16:00', 'Quote — Eskilstuna', 'Hello Karin,\n\n3 900 SEK excluding VAT.\n\nKind regards,\nMalin Andersson, AA Logistik'],
      ['in', 'Annika Poikela <annika.poikela@se.abb.com>', '17 Sep 08:40', 'Re: Quote — Eskilstuna', 'Accepted — 10 EUR pallets, 120x80x120, pickup Monday.\n\nKarin'],
      ['out', 'annika.poikela@se.abb.com', '22 Sep 15:00', 'Delivered', 'Hello Karin,\n\nDelivered in Eskilstuna at 11:20.\n\nKind regards,\nMalin Andersson, AA Logistik']
    ]
  }
];

// Append MORE_CASES to INITIAL_CASES
MORE_CASES_DATA.forEach((d) => INITIAL_CASES.push(mkCase(d)));

export type CaseStatusTag =
  | 'Needs Review'
  | 'Ready for Order'
  | 'Order Created'
  | 'In Progress'
  | 'Awaiting Information'
  | 'Completed'
  | 'Cancelled'
  | 'Received'
  | 'Under Review'
  | 'Ready to Proceed';

export const getCaseStatus = (c: CaseItem): { label: CaseStatusTag; tone: 'green' | 'amber' | 'blue' | 'purple' | 'plain' } => {
  if (c.status) {
    const s = c.status as CaseStatusTag;
    let tone: 'green' | 'amber' | 'blue' | 'purple' | 'plain' = 'blue';
    if (s === 'Completed' || s === 'Order Created') tone = 'green';
    else if (s === 'Needs Review' || s === 'Under Review' || s === 'Awaiting Information') tone = 'amber';
    else if (s === 'Ready for Order' || s === 'Ready to Proceed') tone = 'purple';
    else if (s === 'Cancelled') tone = 'plain';
    return { label: s, tone };
  }
  if (c.lifecycle === 'Cancelled') {
    return { label: 'Cancelled', tone: 'plain' };
  }
  if (c.lifecycle === 'Completed') {
    return { label: 'Completed', tone: 'green' };
  }
  if (
    c.conditions.includes('Missing Information') ||
    c.conditions.includes('Waiting for Customer') ||
    c.comm.state === 'Waiting for Customer' ||
    c.tasks.some((t) => t.readiness === 'Waiting for Customer' && t.status !== 'Done')
  ) {
    return { label: 'Awaiting Information', tone: 'amber' };
  }
  if (
    c.intake ||
    c.conditions.includes('Needs Review') ||
    c.data.flatMap((g) => g.fields).some((f) => f.rev === 'Conflict Detected')
  ) {
    return { label: 'Needs Review', tone: 'amber' };
  }

  const doneCount = c.tasks.filter((t) => t.status === 'Done').length;
  const wipCount = c.tasks.filter((t) => t.status === 'In Progress').length;

  if (wipCount > 0 || (doneCount > 0 && doneCount < c.tasks.length)) {
    return { label: 'In Progress', tone: 'blue' };
  }

  if (c.tasks.length > 0 && c.tasks.some((t) => t.readiness === 'Ready')) {
    return { label: 'Ready for Order', tone: 'purple' };
  }

  if (c.lifecycle === 'New' || c.tasks.length === 0) {
    return { label: 'Needs Review', tone: 'amber' };
  }

  return { label: 'In Progress', tone: 'blue' };
};

export const generateTasksForDepartment = (c: CaseItem, dept: string): Task[] => {
  const isOrder = c.caseClass === 'Confirmed Order' || c.caseClass === 'Change Request';
  const ts = Date.now().toString().slice(-4);

  // Ensure workItem exists
  let wi = c.workItems.find((w) => w.dept === dept);
  if (!wi) {
    const wiId = `wi_${dept.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${ts}`;
    wi = {
      id: wiId,
      name: `${dept} Execution`,
      dept: dept
    };
    c.workItems.push(wi);
  }

  const generated: Task[] = [];

  if (dept === 'Warehouse') {
    generated.push(
      {
        id: `T_WH1_${ts}`,
        wi: wi.id,
        title: 'Prepare receiving & warehouse staging area',
        dept: 'Warehouse',
        assignee: 'Anna Svensson',
        status: 'To Do',
        readiness: 'Ready',
        priority: 'Normal',
        due: 'Today 14:00',
        timing: 'On Track',
        milestone: false,
        desc: 'Reserve floor bay and check inbound slot.'
      },
      {
        id: `T_WH2_${ts}`,
        wi: wi.id,
        title: 'Receive goods and physical inspection',
        dept: 'Warehouse',
        assignee: 'Stefan Berg',
        status: 'To Do',
        readiness: 'Upcoming',
        priority: 'High',
        due: 'Today 15:30',
        timing: 'On Track',
        milestone: false,
        desc: 'Unload pallets, inspect seal, check against freight document.'
      },
      {
        id: `T_WH3_${ts}`,
        wi: wi.id,
        title: 'Register in WMS & assign location rack',
        dept: 'Warehouse',
        assignee: 'Anna Svensson',
        status: 'To Do',
        readiness: 'Upcoming',
        priority: 'Normal',
        due: 'Tomorrow 10:00',
        timing: 'On Track',
        milestone: true,
        desc: 'Scan barcodes and update warehouse stock balance.'
      }
    );
  } else if (dept === 'Packing') {
    generated.push(
      {
        id: `T_PK1_${ts}`,
        wi: wi.id,
        title: 'Repack to specification & strapping',
        dept: 'Packing',
        assignee: 'Stefan Berg',
        status: 'To Do',
        readiness: 'Ready',
        priority: 'Normal',
        due: 'Today 15:00',
        timing: 'On Track',
        milestone: false,
        desc: 'Repacking and strapping according to customer specifications.'
      },
      {
        id: `T_PK2_${ts}`,
        wi: wi.id,
        title: 'Quality inspection & label crating',
        dept: 'Packing',
        assignee: 'Stefan Berg',
        status: 'To Do',
        readiness: 'Upcoming',
        priority: 'High',
        due: 'Today 16:30',
        timing: 'On Track',
        milestone: true,
        desc: 'Verify gross package weight and affix consignment stickers.'
      }
    );
  } else if (dept === 'Freight Forwarding') {
    generated.push(
      {
        id: `T_FF1_${ts}`,
        wi: wi.id,
        title: 'Validate shipment specifications & customs docs',
        dept: 'Freight Forwarding',
        assignee: 'Malin Andersson',
        status: 'To Do',
        readiness: 'Ready',
        priority: 'Normal',
        due: 'Today 13:00',
        timing: 'On Track',
        milestone: false,
        desc: 'Verify cargo specifications, dimensions and carrier routing.'
      },
      {
        id: `T_FF2_${ts}`,
        wi: wi.id,
        title: 'Select linehaul carrier & book slot',
        dept: 'Freight Forwarding',
        assignee: 'Andreas Backström',
        status: 'To Do',
        readiness: 'Waiting for Task',
        priority: 'Normal',
        due: 'Today 14:30',
        timing: 'On Track',
        milestone: false,
        desc: 'Confirm carrier slot and pickup window.'
      },
      {
        id: `T_FF3_${ts}`,
        wi: wi.id,
        title: 'Issue international waybill & dispatch consignment',
        dept: 'Freight Forwarding',
        assignee: 'Malin Andersson',
        status: 'To Do',
        readiness: 'Waiting for Task',
        priority: 'High',
        due: 'Today 15:30',
        timing: 'On Track',
        milestone: true,
        desc: 'Enter forwarding waybill in system and dispatch.'
      }
    );
  } else if (dept === 'Finance') {
    generated.push(
      {
        id: `T_FI1_${ts}`,
        wi: wi.id,
        title: 'Verify freight pricing & customer contract rates',
        dept: 'Finance',
        assignee: 'Order Desk',
        status: 'To Do',
        readiness: 'Ready',
        priority: 'Normal',
        due: 'Today 16:00',
        timing: 'On Track',
        milestone: false,
        desc: 'Audit pricing schedule against contracted customer tariff.'
      },
      {
        id: `T_FI2_${ts}`,
        wi: wi.id,
        title: 'Pre-invoice audit & Summera release',
        dept: 'Finance',
        assignee: 'Order Desk',
        status: 'To Do',
        readiness: 'Upcoming',
        priority: 'Normal',
        due: 'Tomorrow 09:00',
        timing: 'On Track',
        milestone: true,
        desc: 'Release billing record to customer accounts receivable.'
      }
    );
  } else {
    // Transport
    if (isOrder) {
      generated.push(
        {
          id: `T_TR1_${ts}`,
          wi: wi.id,
          title: 'Validate transport route & cargo dimensions',
          dept: 'Transport',
          assignee: 'Andreas Backström',
          status: 'To Do',
          readiness: 'Ready',
          priority: 'High',
          due: 'Today 12:00',
          timing: 'On Track',
          milestone: false,
          desc: 'Verify route schedule and loading window.'
        },
        {
          id: `T_TR2_${ts}`,
          wi: wi.id,
          title: 'Dispatch vehicle & assign driver',
          dept: 'Transport',
          assignee: 'Malin Andersson',
          status: 'To Do',
          readiness: 'Ready',
          priority: 'High',
          due: 'Today 12:30',
          timing: 'On Track',
          milestone: false,
          desc: 'Assign vehicle and confirm loading slot.'
        },
        {
          id: `T_TR3_${ts}`,
          wi: wi.id,
          title: 'Create & confirm Opter order',
          dept: 'Transport',
          assignee: 'Malin Andersson',
          status: 'To Do',
          readiness: 'Upcoming',
          priority: 'High',
          due: 'Today 13:00',
          timing: 'On Track',
          milestone: true,
          desc: 'Register freight bill in Opter.'
        }
      );
    } else {
      generated.push(
        {
          id: `T_TR1_${ts}`,
          wi: wi.id,
          title: 'Review transport inquiry & requirements',
          dept: 'Transport',
          assignee: 'Andreas Backström',
          status: 'To Do',
          readiness: 'Ready',
          priority: 'Normal',
          due: 'Today 12:00',
          timing: 'On Track',
          milestone: false,
          desc: 'Analyze request details and vehicle requirements.'
        },
        {
          id: `T_TR2_${ts}`,
          wi: wi.id,
          title: 'Obtain pricing and operational input',
          dept: 'Transport',
          assignee: 'Andreas Backström',
          status: 'To Do',
          readiness: 'Ready',
          priority: 'Normal',
          due: 'Today 14:00',
          timing: 'On Track',
          milestone: false,
          desc: 'Calculate mileage, tolls and driver costs.'
        },
        {
          id: `T_TR3_${ts}`,
          wi: wi.id,
          title: 'Send quote to customer',
          dept: 'Transport',
          assignee: 'Malin Andersson',
          status: 'To Do',
          readiness: 'Upcoming',
          priority: 'Normal',
          due: 'Today 16:00',
          timing: 'On Track',
          milestone: true,
          desc: 'Submit written quote.'
        }
      );
    }
  }

  return generated;
};
