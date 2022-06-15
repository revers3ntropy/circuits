import type v2 from "./v2";

export function rect (ctx: CanvasRenderingContext2D, position: v2, width: number, height: number, colour: string) {
	ctx.beginPath();

	ctx.rect(position.x, position.y, width, height);

	ctx.fillStyle = colour;

	ctx.fill();
	ctx.closePath();
}

export function circle (ctx: CanvasRenderingContext2D, position: v2, radius: number, colour: string) {
	ctx.beginPath();

	ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);

	ctx.fillStyle = colour;

	ctx.fill();
	ctx.closePath();
}

export function line (ctx: CanvasRenderingContext2D, start: v2, end: v2, colour: string) {
	ctx.beginPath();

	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);

	ctx.strokeStyle = colour;
	ctx.stroke();
	ctx.closePath();
}

export function arrow (ctx: CanvasRenderingContext2D, start: v2, end: v2, arrowSize: number, colour: string, arrowPlacement=0) {
	ctx.beginPath();

	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const angle = Math.atan2(dy, dx);

	let mid = end.clone.sub(end.clone.sub(start).scale(arrowPlacement));

	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.moveTo(mid.x, mid.y);
	ctx.lineTo(
		mid.x - arrowSize * Math.cos(angle - Math.PI / 6),
		mid.y - arrowSize * Math.sin(angle - Math.PI / 6)
	);
	ctx.moveTo(mid.x, mid.y);
	ctx.lineTo(
		mid.x - arrowSize * Math.cos(angle + Math.PI / 6),
		mid.y - arrowSize * Math.sin(angle + Math.PI / 6)
	);

	ctx.strokeStyle = colour;
	ctx.stroke();
	ctx.closePath();
}