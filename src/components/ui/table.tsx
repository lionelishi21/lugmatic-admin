import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className = '', ...props }) => (
  <table className={className} {...props} />
);
export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => <thead {...props} />;
export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = (props) => <tbody {...props} />;
export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = (props) => <tr {...props} />;
export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = (props) => <th {...props} />;
export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = (props) => <td {...props} />;

export default Table;

