export const deskStructure = (S: any) =>
  S.list()
    .title('Gestión de Contenido')
    .items([
      S.listItem()
        .title('Cartelera y Eventos')
        .child(S.documentTypeList('cartelera').title('Cartelera')),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem: any) => !['cartelera'].includes(listItem.getId())
      ),
    ]);
