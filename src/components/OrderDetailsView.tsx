import React, { useState } from 'react';
import { CaseItem, CaseField, OrderItem } from '../types';

interface OrderDetailsViewProps {
  c: CaseItem;
  onSaveField: (c: CaseItem, f: CaseField, val: string) => void;
  onSaveHeader: (c: CaseItem, updated: Partial<CaseItem>) => void;
  onOpenOpterModal: (c: CaseItem) => void;
  toast?: (text: string, kind?: string) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  defaultVal: string;
  conf: number | null;
  hasDropdown?: boolean;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  c,
  onSaveField,
  onSaveHeader,
  onOpenOpterModal,
  toast
}) => {
  // Section edit toggles
  const [editingSection, setEditingSection] = useState<number | null>(null);

  // Field values state for all sections
  const [values, setValues] = useState<Record<string, string>>(() => {
    const allFields = c.data.flatMap((g) => g.fields);
    const findF = (keys: string[], def: string) => {
      const found = allFields.find((f) =>
        keys.some((k) => f.k.toLowerCase().includes(k.toLowerCase()) || (f.swedishName && f.swedishName.toLowerCase().includes(k.toLowerCase())))
      );
      return found?.v || def;
    };

    return {
      // 1. Customer / Order
      customerCode: findF(['Customer Code', 'Kundkod'], 'MACHINESOUT'),
      customerName: c.customer || findF(['Customer Name', 'Kund'], 'ABB AB, Machines Outbound'),
      contactName: c.contact || findF(['Contact Name', 'Beställare'], 'Robert Svantesson'),
      projectRef: findF(['Project / Reference', 'Littera/Projekt'], '4575381675'),
      poNumber: findF(['PO Number', 'PO-nummer'], '4575381675'),
      customerNumber: findF(['Customer Number', 'Kundnummer'], '99111346'),
      payerContact: findF(['Payer / Contact', 'Betalare/Telefon'], 'Avsändare'),
      invoiceMarking: findF(['Invoice Marking', 'Fakturamärkning'], 'L009717'),
      region: findF(['Region'], '[Ingen]'),
      summeraId: findF(['Summera ID', 'Summary ID', 'Summera-ID'], '325841'),

      // 2. Pickup (Sender)
      senderTitle: findF(['Sender Name', 'Namn'], 'Machines Baksidan (PORT 7)'),
      senderStreet: findF(['Street / Number', 'Gata/Nr'], 'Elmotargatan 42'),
      senderCityCountry: '72136 Västerås, Sweden',
      senderCodeNumber: findF(['Sender Customer Code', 'Kundkod/Kundnummer'], '394MACHINESBAK'),
      pickupDateTime: findF(['Pickup Date / Time', 'Tid/Datum'], '25 Sep 2024, 13:00'),
      pickupGeoZone: findF(['Geographic / Price Zone', 'Geozon/Priszon'], 'Västerås / Västerås'),
      pickupCodePhone: findF(['Code / Telephone', 'Kod/Tel'], '—'),

      // 3. Delivery (Receiver)
      receiverTitle: findF(['Receiver Name'], 'MPA Måleriproduktion AB'),
      receiverStreet: 'Skåp... 5',
      receiverCityCountry: '72132 Västerås, Sweden',
      receiverCodeNumber: '—',
      deliveryDateTime: '—',
      deliveryGeoZone: findF(['Geographic / Price Zone', 'Geozon/Priszon'], 'Västerås / Västerås'),
      deliveryCodePhone: '—',

      // 4. Shipment Details
      freightDocNo: findF(['Freight Document No.', 'Fraktsedelsnr'], '1000962512'),
      senderRef: findF(['Sender Reference', 'Avsändarref'], 'Robert Svantesson'),
      receiverRef: findF(['Receiver Reference', 'Mottagareref'], '—'),
      estCo2: '—',
      calcCo2: findF(['Calculated CO₂ Emission', 'Beräknat CO2'], '0,00'),
      distance: findF(['Distance', 'Avstånd'], '11,665'),
      drivingTime: findF(['Driving Time', 'Körtid'], '0:22'),

      // 5. Dimensions
      packageCount: findF(['Number of Packages', 'Kollin'], '1'),
      weight: c.weight || findF(['Total weight', 'Vikt'], '8 100,00 kg'),
      length: findF(['Length', 'Längd'], '4,70 m'),
      width: findF(['Width', 'Bredd'], '3,40 m'),
      height: findF(['Height', 'Höjd'], '1,50 m'),
      volume: findF(['Volume', 'Volym'], '23,97 m³'),
      palletPlaces: findF(['Pallet Places', 'Pallplats'], '0,00'),
      loadingMeters: findF(['Loading Meters', 'Flakmeter'], '0,00'),
      chargeableWeight: findF(['Chargeable Weight', 'Prissättningsvikt'], '8 100,00'),
      units: findF(['Units', 'Enhet'], '0,00')
    };
  });

  // Draft values during editing
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  // Items for Section 6
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (c.items && c.items.length > 0) return c.items;
    return [
      {
        id: 'item-1',
        qty: 1,
        type: '—',
        marking: 'L009717-A8',
        goodsType: 'BALJA (AMS 1400)',
        weight: '8 100,00 kg',
        volume: '23,97 m³',
        loadingMeters: '0,00',
        palletPlaces: '0,00',
        length: '4,70',
        width: '3,40',
        height: '1,50',
        packageNo: '—',
        confidence: 93,
        name: 'BALJA (AMS 1400)'
      }
    ];
  });

  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [activeItemMenu, setActiveItemMenu] = useState<number | null>(null);

  const startEditSection = (sectionNumber: number) => {
    setEditingSection(sectionNumber);
    setDraftValues({ ...values });
    if (sectionNumber === 6) {
      setDraftItems(JSON.parse(JSON.stringify(items)));
    }
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setDraftValues({});
    setDraftItems([]);
  };

  const saveSection = (sectionNumber: number) => {
    const updated = { ...values, ...draftValues };
    setValues(updated);

    // Sync back to c.data and case fields
    c.data.forEach((group) => {
      group.fields.forEach((field) => {
        const k = field.k.toLowerCase();
        if (k.includes('customer code') && draftValues.customerCode !== undefined) onSaveField(c, field, draftValues.customerCode);
        else if (k.includes('contact name') && draftValues.contactName !== undefined) onSaveField(c, field, draftValues.contactName);
        else if (k.includes('po number') && draftValues.poNumber !== undefined) onSaveField(c, field, draftValues.poNumber);
        else if (k.includes('freight document') && draftValues.freightDocNo !== undefined) onSaveField(c, field, draftValues.freightDocNo);
        else if (k.includes('total weight') && draftValues.weight !== undefined) onSaveField(c, field, draftValues.weight);
      });
    });

    if (draftValues.customerName && draftValues.customerName !== c.customer) {
      onSaveHeader(c, { customer: draftValues.customerName });
    }
    if (draftValues.contactName && draftValues.contactName !== c.contact) {
      onSaveHeader(c, { contact: draftValues.contactName });
    }
    if (draftValues.weight && draftValues.weight !== c.weight) {
      onSaveHeader(c, { weight: draftValues.weight });
    }

    if (sectionNumber === 6 && draftItems.length > 0) {
      setItems(draftItems);
      c.items = draftItems;
      onSaveHeader(c, { items: draftItems });
    }

    setEditingSection(null);
    setDraftValues({});
    setDraftItems([]);
    if (toast) toast(`Section ${sectionNumber} updated`, 'good');
  };

  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: `item-${Date.now()}`,
      qty: 1,
      type: '—',
      marking: `MK-${Math.floor(1000 + Math.random() * 9000)}`,
      goodsType: 'Standard Palletized Cargo',
      weight: '500,00 kg',
      volume: '1,20 m³',
      loadingMeters: '0,40',
      palletPlaces: '1,00',
      length: '1,20',
      width: '0,80',
      height: '1,25',
      packageNo: '—',
      confidence: 90,
      name: 'Standard Palletized Cargo'
    };

    if (editingSection === 6) {
      setDraftItems((prev) => [...prev, newItem]);
    } else {
      const updated = [...items, newItem];
      setItems(updated);
      c.items = updated;
      onSaveHeader(c, { items: updated });
      if (toast) toast('New item added', 'good');
    }
  };

  const handleDeleteItem = (idx: number) => {
    if (editingSection === 6) {
      setDraftItems((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const updated = items.filter((_, i) => i !== idx);
      setItems(updated);
      c.items = updated;
      onSaveHeader(c, { items: updated });
      if (toast) toast('Item removed');
    }
    setActiveItemMenu(null);
  };

  const handleDuplicateItem = (idx: number) => {
    const target = items[idx];
    if (!target) return;
    const duplicated: OrderItem = {
      ...target,
      id: `item-${Date.now()}`,
      marking: `${target.marking || 'ITEM'}-COPY`
    };
    const updated = [...items, duplicated];
    setItems(updated);
    c.items = updated;
    onSaveHeader(c, { items: updated });
    setActiveItemMenu(null);
    if (toast) toast('Item duplicated', 'good');
  };

  // Helper for confidence badge
  const renderConfidenceBadge = (conf: number | null | undefined) => {
    if (conf === null || conf === undefined) {
      return (
        <span className="inline-flex items-center justify-center w-11 h-6 rounded text-[11px] font-medium bg-[#F1F3F5] text-[#9CA3AF] border border-[#E5E7EB] shrink-0">
          —
        </span>
      );
    }

    const toneClass =
      conf >= 80
        ? 'bg-[#E8F8EE] text-[#1E7E34] border border-[#C3E6CB]'
        : conf >= 60
        ? 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]'
        : 'bg-[#FDF2F2] text-[#B91C1C] border border-[#F8B4B4]';

    return (
      <span
        className={`inline-flex items-center justify-center w-11 h-6 rounded text-[11px] font-semibold shrink-0 ${toneClass}`}
        title={`${conf}% confidence`}
      >
        {conf}%
      </span>
    );
  };

  // Renders a single field row matching the image layout and theme
  const renderFieldRow = (
    fieldKey: string,
    label: string,
    conf: number | null,
    hasDropdown: boolean = false,
    sectionNumber: number,
    options?: string[]
  ) => {
    const isEditing = editingSection === sectionNumber;
    const currentVal = isEditing ? draftValues[fieldKey] ?? values[fieldKey] ?? '' : values[fieldKey] ?? '—';

    return (
      <div className="flex items-center gap-2.5 min-h-[34px]">
        {/* Label on left */}
        <span className="text-[12.5px] font-normal text-[#5A5865] w-[135px] sm:w-[150px] shrink-0 truncate">
          {label}
        </span>

        {/* Input box in middle */}
        <div className="flex-1 flex items-center min-w-0">
          {isEditing ? (
            hasDropdown && options && options.length > 0 ? (
              <div className="relative w-full">
                <select
                  value={currentVal}
                  onChange={(e) => setDraftValues((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                  className="w-full h-8 px-2.5 pr-8 text-[12.5px] text-[#17171D] bg-white border border-[#0E6F74] rounded focus:outline-none focus:ring-1 focus:ring-[#0E6F74] transition appearance-none cursor-pointer"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  {currentVal && !options.includes(currentVal) && (
                    <option value={currentVal}>{currentVal}</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#9CA3AF]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={currentVal}
                onChange={(e) => setDraftValues((prev) => ({ ...prev, [fieldKey]: e.target.value }))}
                placeholder="Enter value"
                className="w-full h-8 px-2.5 text-[12.5px] text-[#17171D] bg-white border border-[#0E6F74] rounded focus:outline-none focus:ring-1 focus:ring-[#0E6F74] transition"
              />
            )
          ) : (
            <div
              onClick={() => startEditSection(sectionNumber)}
              title="Click to edit section"
              className="w-full flex items-center justify-between h-8 px-2.5 bg-white border border-[#E5E7EB] rounded text-[12.5px] text-[#17171D] hover:border-[#CBD5E1] hover:bg-[#FAF9F6] transition cursor-pointer"
            >
              <span className="truncate">{currentVal || '—'}</span>
              {hasDropdown && (
                <svg
                  className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 ml-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* Confidence pill on right */}
        {renderConfidenceBadge(conf)}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-[#17171D] font-sans pb-10">
      {/* Top Action Bar with Create Opter Order */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E6E3DC] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div>
          <h2 className="text-[15px] font-bold text-[#17171D] tracking-tight">Order Specifications & EDI Dispatch</h2>
          <p className="text-[12px] text-[#7A7984] mt-0.5">Review verified transport fields before generating Opter freight documents</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenOpterModal(c)}
            className="btn btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-semibold text-white rounded-lg transition shadow-xs cursor-pointer"
            style={{
              background: 'linear-gradient(180deg, #137B80, #0E6F74)',
              borderColor: '#0C6368'
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Opter Order</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. Customer / Order */}
      {/* ============================================================== */}
      <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA]">
          <div>
            <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">1. Customer / Order</h3>
            <p className="text-[12px] text-[#7A7984] mt-0.5">Customer, contact and order related information</p>
          </div>
          {editingSection === 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveSection(1)}
                className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => startEditSection(1)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
            >
              <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span>Edit section</span>
            </button>
          )}
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2.5">
          {/* Left Column */}
          <div className="flex flex-col gap-2.5">
            {renderFieldRow('customerCode', 'Customer Code', 98, true, 1, [
              'MACHINESOUT',
              'ABB_VSTM',
              'ABB_MOTORS',
              'VOLVO_CE',
              'ALSTOM_SE'
            ])}
            {renderFieldRow('customerName', 'Customer Name', 96, true, 1, [
              'ABB AB, Machines Outbound',
              'ABB AB, Motors & Generators',
              'ABB Electrification Sweden AB',
              'Volvo Construction Equipment AB',
              'Alstom Sweden AB'
            ])}
            {renderFieldRow('contactName', 'Contact Name', 93, false, 1)}
            {renderFieldRow('projectRef', 'Project / Reference', 95, false, 1)}
            {renderFieldRow('poNumber', 'PO Number', 95, false, 1)}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2.5">
            {renderFieldRow('customerNumber', 'Customer Number', 98, false, 1)}
            {renderFieldRow('payerContact', 'Payer / Contact', 70, true, 1, [
              'Avsändare',
              'Mottagare',
              'Tredje part',
              'Kundavtal'
            ])}
            {renderFieldRow('invoiceMarking', 'Invoice Marking', 90, false, 1)}
            {renderFieldRow('region', 'Region', 65, true, 1, [
              '[Ingen]',
              'Västmanland / Mälardalen',
              'Svealand',
              'Götaland',
              'Norrland',
              'Internationellt'
            ])}
            {renderFieldRow('summeraId', 'Summera ID', 98, false, 1)}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2 & 3: Pickup (Sender) and Delivery (Receiver) Side-by-Side */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Section 2: Pickup (Sender) */}
        <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA]">
              <div>
                <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">2. Pickup (Sender)</h3>
                <p className="text-[12px] text-[#7A7984] mt-0.5">Collection location and contact details</p>
              </div>
              {editingSection === 2 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSection(2)}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditSection(2)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
                >
                  <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit section</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Location Card */}
              <div className="w-full sm:w-[210px] shrink-0 bg-[#F4F8FC] border border-[#DBEAFE] rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center mb-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l8-4v18M13 7l6 3v11M9 9v1M9 13v1M9 17v1" />
                    </svg>
                  </div>
                  {editingSection === 2 ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={draftValues.senderTitle ?? values.senderTitle}
                        onChange={(e) => setDraftValues((p) => ({ ...p, senderTitle: e.target.value }))}
                        className="text-[12.5px] font-bold border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="Location Name"
                      />
                      <input
                        type="text"
                        value={draftValues.senderStreet ?? values.senderStreet}
                        onChange={(e) => setDraftValues((p) => ({ ...p, senderStreet: e.target.value }))}
                        className="text-[11.5px] border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="Street"
                      />
                      <input
                        type="text"
                        value={draftValues.senderCityCountry ?? values.senderCityCountry}
                        onChange={(e) => setDraftValues((p) => ({ ...p, senderCityCountry: e.target.value }))}
                        className="text-[11.5px] border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="City, Country"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-[13px] text-[#1E293B] leading-snug">
                        {values.senderTitle}
                      </div>
                      <div className="text-[12px] text-[#64748B] mt-1.5">
                        {values.senderStreet}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        {values.senderCityCountry}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 flex flex-col gap-2.5">
                {renderFieldRow('senderCodeNumber', 'Customer Code / Number', 96, true, 2, [
                  '394MACHINESBAK',
                  '394MACHINESFRAM',
                  '394CENTRAL',
                  'ABB_PORT7'
                ])}
                {renderFieldRow('pickupDateTime', 'Pickup Date / Time', 90, true, 2, [
                  '25 Sep 2024, 13:00',
                  '25 Sep 2024, 14:00',
                  '25 Sep 2024, 15:30',
                  '26 Sep 2024, 08:00',
                  '26 Sep 2024, 10:00'
                ])}
                {renderFieldRow('pickupGeoZone', 'Geographic / Price Zone', 88, true, 2, [
                  'Västerås / Västerås',
                  'Stockholm / Mälardalen',
                  'Örebro / Närke',
                  'Eskilstuna / Södermanland'
                ])}
                {renderFieldRow('pickupCodePhone', 'Code / Telephone', null, false, 2)}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Delivery (Receiver) */}
        <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA]">
              <div>
                <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">3. Delivery (Receiver)</h3>
                <p className="text-[12px] text-[#7A7984] mt-0.5">Delivery location and contact details</p>
              </div>
              {editingSection === 3 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSection(3)}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditSection(3)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
                >
                  <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit section</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Location Card */}
              <div className="w-full sm:w-[210px] shrink-0 bg-[#F4F8FC] border border-[#DBEAFE] rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#1D4ED8] flex items-center justify-center mb-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18M5 21V7l8-4v18M13 7l6 3v11M9 9v1M9 13v1M9 17v1" />
                    </svg>
                  </div>
                  {editingSection === 3 ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={draftValues.receiverTitle ?? values.receiverTitle}
                        onChange={(e) => setDraftValues((p) => ({ ...p, receiverTitle: e.target.value }))}
                        className="text-[12.5px] font-bold border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="Location Name"
                      />
                      <input
                        type="text"
                        value={draftValues.receiverStreet ?? values.receiverStreet}
                        onChange={(e) => setDraftValues((p) => ({ ...p, receiverStreet: e.target.value }))}
                        className="text-[11.5px] border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="Street"
                      />
                      <input
                        type="text"
                        value={draftValues.receiverCityCountry ?? values.receiverCityCountry}
                        onChange={(e) => setDraftValues((p) => ({ ...p, receiverCityCountry: e.target.value }))}
                        className="text-[11.5px] border border-[#DBEAFE] rounded p-1 bg-white"
                        placeholder="City, Country"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-[13px] text-[#1E293B] leading-snug">
                        {values.receiverTitle}
                      </div>
                      <div className="text-[12px] text-[#64748B] mt-1.5">
                        {values.receiverStreet}
                      </div>
                      <div className="text-[12px] text-[#64748B]">
                        {values.receiverCityCountry}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 flex flex-col gap-2.5">
                {renderFieldRow('receiverCodeNumber', 'Customer Code / Number', null, false, 3)}
                {renderFieldRow('deliveryDateTime', 'Delivery Date / Time', null, false, 3)}
                {renderFieldRow('deliveryGeoZone', 'Geographic / Price Zone', 88, true, 3, [
                  'Västerås / Västerås',
                  'Stockholm / Mälardalen',
                  'Örebro / Närke',
                  'Eskilstuna / Södermanland',
                  'Göteborg / Region Väst'
                ])}
                {renderFieldRow('deliveryCodePhone', 'Code / Telephone', null, false, 3)}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* 4 & 5: Shipment Details and Dimensions Side-by-Side */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Section 4: Shipment Details */}
        <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA]">
              <div>
                <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">4. Shipment Details</h3>
                <p className="text-[12px] text-[#7A7984] mt-0.5">Transport and handling information</p>
              </div>
              {editingSection === 4 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSection(4)}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditSection(4)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
                >
                  <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit section</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
              {/* Sub-col 1 - All Text Fields */}
              <div className="flex flex-col gap-2.5">
                {renderFieldRow('freightDocNo', 'Freight Document No.', 97, false, 4)}
                {renderFieldRow('senderRef', 'Sender Reference', 93, false, 4)}
                {renderFieldRow('receiverRef', 'Receiver Reference', null, false, 4)}
              </div>

              {/* Sub-col 2 - All Text Fields */}
              <div className="flex flex-col gap-2.5">
                {renderFieldRow('estCo2', 'Estimated CO₂ Emission (g)', null, false, 4)}
                {renderFieldRow('calcCo2', 'Calculated CO₂ Emission (g)', 90, false, 4)}
                {renderFieldRow('distance', 'Distance', 88, false, 4)}
                {renderFieldRow('drivingTime', 'Driving Time', 90, false, 4)}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Dimensions */}
        <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA]">
              <div>
                <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">5. Dimensions</h3>
                <p className="text-[12px] text-[#7A7984] mt-0.5">Total shipment dimensions and weights</p>
              </div>
              {editingSection === 5 ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSection(5)}
                    className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditSection(5)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
                >
                  <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit section</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
              {/* Sub-col 1 */}
              <div className="flex flex-col gap-2.5">
                {renderFieldRow('packageCount', 'Number of Packages', 96, false, 5)}
                {renderFieldRow('weight', 'Weight', 94, false, 5)}
                {renderFieldRow('length', 'Length', 92, false, 5)}
                {renderFieldRow('width', 'Width', 92, false, 5)}
              </div>

              {/* Sub-col 2 */}
              <div className="flex flex-col gap-2.5">
                {renderFieldRow('height', 'Height', 92, false, 5)}
                {renderFieldRow('volume', 'Volume', 92, false, 5)}
                {renderFieldRow('palletPlaces', 'Pallet Places', 90, false, 5)}
                {renderFieldRow('loadingMeters', 'Loading Meters', 90, false, 5)}
                {renderFieldRow('chargeableWeight', 'Chargeable Weight', 94, false, 5)}
                {renderFieldRow('units', 'Units', 75, false, 5)}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* 6. Goods / Colli Table */}
      {/* ============================================================== */}
      <section className="bg-white rounded-xl border border-[#E6E3DC] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Card Header */}
        <div className="flex items-start justify-between pb-3.5 mb-3.5 border-b border-[#F0EFEA] flex-wrap gap-2">
          <div>
            <h3 className="text-[14.5px] font-bold text-[#17171D] tracking-tight">6. Goods / Colli</h3>
            <p className="text-[12px] text-[#7A7984] mt-0.5">List of items and packaging details</p>
          </div>

          <div className="flex items-center gap-2">
            {editingSection === 6 ? (
              <>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveSection(6)}
                  className="px-3 py-1 text-[12px] font-semibold text-white bg-[#0E6F74] rounded hover:bg-[#0c5c60] transition"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => startEditSection(6)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#46454F] border border-[#D1D5DB] rounded hover:bg-[#F9F8F5] transition"
              >
                <svg className="w-3.5 h-3.5 text-[#7A7984]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit section</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold text-[#0E6F74] border border-[#BCE0E2] rounded bg-[#E4F1F0] hover:bg-[#D4EAE8] transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Goods / Colli Table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left text-[12px] text-[#17171D] border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-[#E6E3DC] text-[11.5px] font-normal text-[#7A7984]">
                <th className="py-2.5 px-2.5 font-normal w-8 text-center">#</th>
                <th className="py-2.5 px-2.5 font-normal">Quantity</th>
                <th className="py-2.5 px-2.5 font-normal">Package Type</th>
                <th className="py-2.5 px-2.5 font-normal">Goods Marking</th>
                <th className="py-2.5 px-2.5 font-normal">Goods Type</th>
                <th className="py-2.5 px-2.5 font-normal">Weight</th>
                <th className="py-2.5 px-2.5 font-normal">Volume</th>
                <th className="py-2.5 px-2.5 font-normal">Loading Meters</th>
                <th className="py-2.5 px-2.5 font-normal">Pallet Places</th>
                <th className="py-2.5 px-2.5 font-normal">Length (m)</th>
                <th className="py-2.5 px-2.5 font-normal">Width (m)</th>
                <th className="py-2.5 px-2.5 font-normal">Height (m)</th>
                <th className="py-2.5 px-2.5 font-normal">Package Number</th>
                <th className="py-2.5 px-2.5 font-normal text-center">Confidence</th>
                <th className="py-2.5 px-2.5 font-normal text-center w-10"></th>
              </tr>
            </thead>
            <tbody>
              {(editingSection === 6 ? draftItems : items).map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="border-b border-[#F0EFEA] hover:bg-[#FBFBFA] transition-colors"
                >
                  <td className="py-3 px-2.5 text-center text-[#7A7984] font-medium">{idx + 1}</td>

                  {/* Quantity */}
                  <td className="py-3 px-2.5 font-medium">
                    {editingSection === 6 ? (
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, qty: val } : it)));
                        }}
                        className="w-14 h-7 px-1.5 border border-[#DBEAFE] rounded text-center text-[12px]"
                      />
                    ) : (
                      item.qty
                    )}
                  </td>

                  {/* Package Type */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.type || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, type: val } : it)));
                        }}
                        placeholder="—"
                        className="w-24 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.type || '—'
                    )}
                  </td>

                  {/* Goods Marking */}
                  <td className="py-3 px-2.5 font-medium">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.marking || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, marking: val } : it)));
                        }}
                        className="w-28 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.marking || '—'
                    )}
                  </td>

                  {/* Goods Type */}
                  <td className="py-3 px-2.5 font-semibold text-[#17171D]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.goodsType || item.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, goodsType: val, name: val } : it)));
                        }}
                        className="w-36 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.goodsType || item.name || '—'
                    )}
                  </td>

                  {/* Weight */}
                  <td className="py-3 px-2.5 font-medium whitespace-nowrap">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.weight || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, weight: val } : it)));
                        }}
                        className="w-24 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.weight || '—'
                    )}
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-2.5 font-medium whitespace-nowrap">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.volume || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, volume: val } : it)));
                        }}
                        className="w-20 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.volume || '—'
                    )}
                  </td>

                  {/* Loading Meters */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.loadingMeters || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, loadingMeters: val } : it)));
                        }}
                        className="w-16 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.loadingMeters || '0,00'
                    )}
                  </td>

                  {/* Pallet Places */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.palletPlaces || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, palletPlaces: val } : it)));
                        }}
                        className="w-16 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.palletPlaces || '0,00'
                    )}
                  </td>

                  {/* Length (m) */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.length || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, length: val } : it)));
                        }}
                        className="w-14 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.length || '—'
                    )}
                  </td>

                  {/* Width (m) */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.width || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, width: val } : it)));
                        }}
                        className="w-14 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.width || '—'
                    )}
                  </td>

                  {/* Height (m) */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.height || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, height: val } : it)));
                        }}
                        className="w-14 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.height || '—'
                    )}
                  </td>

                  {/* Package Number */}
                  <td className="py-3 px-2.5 text-[#5A5865]">
                    {editingSection === 6 ? (
                      <input
                        type="text"
                        value={item.packageNo || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraftItems((prev) => prev.map((it, i) => (i === idx ? { ...it, packageNo: val } : it)));
                        }}
                        placeholder="—"
                        className="w-16 h-7 px-1.5 border border-[#DBEAFE] rounded text-[12px]"
                      />
                    ) : (
                      item.packageNo || '—'
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-2.5 text-center">
                    {renderConfidenceBadge(item.confidence ?? 93)}
                  </td>

                  {/* Action Menu */}
                  <td className="py-3 px-2.5 text-center relative">
                    <button
                      type="button"
                      onClick={() => setActiveItemMenu((prev) => (prev === idx ? null : idx))}
                      className="w-7 h-7 inline-flex items-center justify-center rounded text-[#7A7984] hover:bg-gray-100 transition"
                      title="Item actions"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>

                    {activeItemMenu === idx && (
                      <div className="absolute right-0 top-8 w-36 bg-white border border-[#E6E3DC] rounded-lg shadow-lg py-1 z-30 text-left text-[12px]">
                        <button
                          type="button"
                          onClick={() => {
                            startEditSection(6);
                            setActiveItemMenu(null);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#F9F8F5] text-[#17171D]"
                        >
                          ✎ Edit item
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(idx)}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#F9F8F5] text-[#17171D]"
                        >
                          ⧉ Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(idx)}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
