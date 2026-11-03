export interface ShopContact {
  name: string;
  department: string;
  phone: string;
  phone2: string;
  email: string;
}

export interface ShopPopupDetails {
  id: number;
  name: string;
  street: string;
  products: string[];
  offertypes: string[];
  city: string;
  zip: string;
  web: string;
  email: string;
  phone?: string;
  phone2?: string;
  department?: string;
  person?: string;
  note?: string;
  inactive?: boolean;
  no_mailings?: boolean;
  collmex_id?: number;
  groups?: string[];
  contacts?: ShopContact[];
}

const PUBLIC_NOTE =
  'Achtung: vor dem Losfahren bitte anrufen und fragen ob das gewünschte Produkt verfügbar ist. Falls nicht, bitten wir um ein kurzes Feedback';

export function shopPopupHtml(item: ShopPopupDetails, internal: boolean): string {
  const role = item.offertypes.length > 0
    ? `<small>${escapeHtml(item.offertypes.join(', '))} für</small>`
    : '';
  const products = item.products.length > 0
    ? `<small>${escapeHtml(item.products.join(', '))}</small>`
    : '';
  const lines = [
    webLine(item.web),
    mailLine(item.email),
  ];
  if (internal) {
    lines.push(phoneLine(item.phone || '', 'fa-phone'));
    lines.push(phoneLine(item.phone2 || '', 'fa-phone'));
  }

  return `
    <h2>${escapeHtml(item.name)}</h2>
    ${role}
    ${products}
    <br>
    <p>
      ${escapeHtml(item.street)}<br>
      ${escapeHtml(item.zip)} ${escapeHtml(item.city)}
    </p>
    <p>${lines.filter(Boolean).join('<br>')}</p>
    ${internal ? staffBlock(item) : ''}
    <p>
      <i class="fa fa-bullhorn" aria-hidden="true"></i>
      <a href="/feedback/${item.id}">Feedback zu diesem Eintrag?</a>
    </p>
    ${internal ? '' : `<p><small>${PUBLIC_NOTE}</small></p>`}
  `;
}

function staffBlock(item: ShopPopupDetails): string {
  const parts: string[] = [];
  const who = [item.person || '', item.department || ''].filter(Boolean);
  if (who.length > 0) {
    parts.push(`<p>${who.map(escapeHtml).join('<br>')}</p>`);
  }
  if (item.groups && item.groups.length > 0) {
    parts.push(`<small>Gruppen: ${escapeHtml(item.groups.join(', '))}</small>`);
  }
  const flags = [
    item.inactive ? 'inaktiv' : '',
    item.no_mailings ? 'keine Werbung' : '',
  ].filter(Boolean);
  if (flags.length > 0) {
    parts.push(`<small>${escapeHtml(flags.join(' · '))}</small>`);
  }
  if (item.note) {
    parts.push(`<p class="shop-note">${escapeHtml(item.note)}</p>`);
  }
  const contacts = (item.contacts || []).map(contactLine).filter(Boolean);
  if (contacts.length > 0) {
    parts.push(`<ul class="shop-contacts">${contacts.join('')}</ul>`);
  }
  if (item.collmex_id) {
    parts.push(`<small>Collmex ${item.collmex_id}</small>`);
  }
  return parts.join('');
}

function contactLine(contact: ShopContact): string {
  const bits = [
    contact.name ? `<strong>${escapeHtml(contact.name)}</strong>` : '',
    contact.department ? escapeHtml(contact.department) : '',
    phoneLine(contact.phone, 'fa-phone'),
    phoneLine(contact.phone2, 'fa-phone'),
    mailLine(contact.email),
  ].filter(Boolean);
  if (bits.length === 0) {
    return '';
  }
  return `<li>${bits.join('<br>')}</li>`;
}

function webLine(web: string): string {
  if (!web) {
    return '';
  }
  const href = /^https?:\/\//i.test(web) ? web : '';
  const label = escapeHtml(web);
  const body = href
    ? `<a target="_blank" href="${escapeAttr(href)}">${label}</a>`
    : label;
  return `<i class="fa fa-globe" aria-hidden="true"></i> ${body}`;
}

function mailLine(email: string): string {
  if (!email) {
    return '';
  }
  return `<i class="fa fa-envelope" aria-hidden="true"></i> <a href="mailto:${escapeAttr(email)}">${escapeHtml(email)}</a>`;
}

function phoneLine(phone: string, icon: string): string {
  if (!phone) {
    return '';
  }
  const compact = phone.replace(/[^\d+]/g, '');
  const href = /^\+?\d{3,}$/.test(compact) ? `tel:${compact}` : '';
  const label = escapeHtml(phone);
  const body = href
    ? `<a href="${escapeAttr(href)}">${label}</a>`
    : label;
  return `<i class="fa ${icon}" aria-hidden="true"></i> ${body}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
