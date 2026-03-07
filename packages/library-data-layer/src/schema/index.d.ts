export declare const gender: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "gender";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "gender";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "name";
        tableName: "gender";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 100;
      }
    >;
  };
  dialect: "sqlite";
}>;
export declare const publisher: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "publisher";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "publisher";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "name";
        tableName: "publisher";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 200;
      }
    >;
  };
  dialect: "sqlite";
}>;
export declare function getGenderId(): import("drizzle-orm/sqlite-core").SQLiteColumn<
  {
    name: "id";
    tableName: "gender";
    dataType: "number";
    columnType: "SQLiteInteger";
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
    isPrimaryKey: true;
    isAutoincrement: false;
    hasRuntimeDefault: false;
    enumValues: undefined;
    baseColumn: never;
    identity: undefined;
    generated: undefined;
  },
  {},
  {}
>;
export declare function getPublisherId(): import("drizzle-orm/sqlite-core").SQLiteColumn<
  {
    name: "id";
    tableName: "publisher";
    dataType: "number";
    columnType: "SQLiteInteger";
    data: number;
    driverParam: number;
    notNull: true;
    hasDefault: true;
    isPrimaryKey: true;
    isAutoincrement: false;
    hasRuntimeDefault: false;
    enumValues: undefined;
    baseColumn: never;
    identity: undefined;
    generated: undefined;
  },
  {},
  {}
>;
export declare const book: import("drizzle-orm/sqlite-core").SQLiteTableWithColumns<{
  name: "book";
  schema: undefined;
  columns: {
    id: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "id";
        tableName: "book";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    title: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "title";
        tableName: "book";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 500;
      }
    >;
    author: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "author";
        tableName: "book";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 300;
      }
    >;
    isbn: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "isbn";
        tableName: "book";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 20;
      }
    >;
    barcode: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "barcode";
        tableName: "book";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 50;
      }
    >;
    price: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "price";
        tableName: "book";
        dataType: "number";
        columnType: "SQLiteReal";
        data: number;
        driverParam: number;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    language: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "language";
        tableName: "book";
        dataType: "string";
        columnType: "SQLiteText";
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 50;
      }
    >;
    genderId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "gender_id";
        tableName: "book";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    publisherId: import("drizzle-orm/sqlite-core").SQLiteColumn<
      {
        name: "publisher_id";
        tableName: "book";
        dataType: "number";
        columnType: "SQLiteInteger";
        data: number;
        driverParam: number;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: "sqlite";
}>;
export declare const bookRelations: import("drizzle-orm").Relations<
  "book",
  {
    gender: import("drizzle-orm").One<"gender", false>;
    publisher: import("drizzle-orm").One<"publisher", false>;
  }
>;
export declare const genderRelations: import("drizzle-orm").Relations<
  "gender",
  {
    books: import("drizzle-orm").Many<"book">;
  }
>;
export declare const publisherRelations: import("drizzle-orm").Relations<
  "publisher",
  {
    books: import("drizzle-orm").Many<"book">;
  }
>;
