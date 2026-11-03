import { shopPopupHtml } from './shop-popup';

describe('shopPopupHtml', () => {
  const shop = {
    id: 7,
    name: 'A & B',
    street: 'Torstraße 1',
    products: ['Cola'],
    offertypes: ['Laden'],
    city: 'Berlin',
    zip: '10119',
    web: 'https://example.test',
    email: 'a@example.test',
  };

  it('escapes the shop name and leaves staff fields out of the public popup', () => {
    const html = shopPopupHtml({ ...shop, phone: '030123' }, false);
    expect(html).toContain('A &amp; B');
    expect(html).not.toContain('030123');
    expect(html).toContain('vor dem Losfahren');
    expect(html).toContain('href="https://example.test"');
  });

  it('shows phone, contact, note and the collmex number on the internal popup', () => {
    const html = shopPopupHtml({
      ...shop,
      phone: '030 / 123',
      person: 'Ada Lovelace',
      note: 'nur <vormittags>',
      groups: ['Laden', 'ehemalige Kunden'],
      collmex_id: 99,
      inactive: true,
      no_mailings: true,
      contacts: [{
        name: 'Grace Hopper',
        department: 'Einkauf',
        phone: '030111',
        phone2: '',
        email: 'grace@example.test',
      }],
    }, true);

    expect(html).toContain('href="tel:030123"');
    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('nur &lt;vormittags&gt;');
    expect(html).toContain('Gruppen: Laden, ehemalige Kunden');
    expect(html).toContain('Grace Hopper');
    expect(html).toContain('href="tel:030111"');
    expect(html).toContain('Collmex 99');
    expect(html).toContain('inaktiv · keine Werbung');
    expect(html).not.toContain('vor dem Losfahren');
  });
});
