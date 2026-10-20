import React, { useEffect, useRef, useState } from "react";
import { TeaserTopbar } from "./TeaserTopbar";
import { TeaserBody } from "./TeaserBody";
import styles from "./Teaser.module.scss";

export const Teaser = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [videoReady, setVideoReady] = useState(false);

	useEffect(() => {
		if (videoRef.current && videoRef.current.readyState >= 3) setVideoReady(true);
	}, []);

	return (
		<section className={styles.teaser}>
			<div className={styles.background}>
				<video
					ref={videoRef}
					className={styles.video}
					src="/videos/teaser.mp4"
					autoPlay
					muted
					playsInline
					loop
					onCanPlay={() => setVideoReady(true)}
					onPlaying={() => setVideoReady(true)}
				/>
				<img className={styles.shade} src="/images/teaser-shade.svg" alt="" />
				<div
					className={`${styles.videoCover} ${videoReady ? styles.videoCoverReady : ""}`}
					aria-hidden="true"
				/>
			</div>

			<div className={styles.content}>
				<TeaserTopbar />
				<TeaserBody />
			</div>
		</section>
	);
};
