import React, { useState } from "react";
import { Modal } from "antd";
import { IProductFile } from "modules/catalog/shared/model";
import { resolveProductFileUrl } from "modules/catalog/shared/lib/product";
import styles from "./ProductDocuments.module.scss";

const fileName = (file: IProductFile) => {
	if (file.title) return file.title;
	const name = file.path.split("?")[0].split("/").pop() || "Документ PDF";
	try { return decodeURIComponent(name); } catch { return name; }
};

export const ProductDocuments = ({ files }: { files: IProductFile[] }) => {
	const [openedType, setOpenedType] = useState<string | null>(null);
	const groups = [{ type: "DETAILING", title: "Деталировка" }, { type: "MANUAL", title: "Инструкция" }];
	const documents = files.filter((file) => groups.some((group) => group.type === file.type) && file.path && resolveProductFileUrl(file.path));
	const selected = groups.find((group) => group.type === openedType);
	if (!documents.length) return null;
	return <div className={styles.documents}>
		{groups.map((group) => {
			const items = documents.filter((file) => file.type === group.type);
			if (!items.length) return null;
			const label = <><img src="/images/product-detailing.svg" alt="" />{group.title}<small className={styles.small}>PDF</small></>;
			return items.length === 1
				? <a key={group.type} className={styles.document} href={resolveProductFileUrl(items[0].path)} target="_blank" rel="noreferrer">{label}</a>
				: <button key={group.type} className={styles.document} type="button" onClick={() => setOpenedType(group.type)}>{label}</button>;
		})}
		<Modal title={selected?.title} open={Boolean(selected)} onCancel={() => setOpenedType(null)} footer={null}>
			<p>Выберите файл для вашей модели и года выпуска.</p>
			<ul className={styles.files}>{documents.filter((file) => file.type === openedType).map((file) => <li key={file.id}>
				<a href={resolveProductFileUrl(file.path)} target="_blank" rel="noreferrer">{fileName(file)}</a>
			</li>)}</ul>
		</Modal>
	</div>;
};
