import React, { useEffect, useRef, useState } from "react";
import styles from "./Skeleton.module.scss";

export const Skeleton = ({
	width,
	height = 18,
	className = "",
}: {
	width?: React.CSSProperties["width"];
	height?: React.CSSProperties["height"];
	className?: string;
}) => <span aria-hidden="true" className={`${styles.block} ${className}`} style={{ width, height }} />;

export const SkeletonRegion = ({
	children,
	className = "",
	label = "Загрузка контента",
}: {
	children: React.ReactNode;
	className?: string;
	label?: string;
}) => (
	<div className={`${styles.region} ${className}`} role="status" aria-label={label} aria-busy="true">
		<span className={styles.srOnly}>{label}</span>
		<div aria-hidden="true">{children}</div>
	</div>
);

export const SkeletonLines = ({ count = 4 }: { count?: number }) => (
	<div className={styles.lines}>
		{Array.from({ length: count }, (_, i) => (
			<Skeleton key={i} width={i === count - 1 ? "64%" : "100%"} />
		))}
	</div>
);

export const ContentImage = ({
	src,
	className = "",
	onLoad,
	onError,
	...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
	const ref = useRef<HTMLImageElement>(null);
	const [settledSrc, setSettledSrc] = useState<React.ImgHTMLAttributes<HTMLImageElement>["src"]>();
	useEffect(() => {
		if (ref.current?.complete) setSettledSrc(src);
	}, [src]);
	return (
		<img
			{...props}
			ref={ref}
			src={src}
			className={`${className} ${settledSrc !== src ? styles.imageLoading : ""}`}
			onLoad={(event) => {
				setSettledSrc(src);
				onLoad?.(event);
			}}
			onError={(event) => {
				setSettledSrc(src);
				onError?.(event);
			}}
		/>
	);
};
