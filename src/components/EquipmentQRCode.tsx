import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Equipment } from "@/data/mock-data";

interface Props {
  equipment: Equipment;
  companyName?: string;
}

export const EquipmentQRCode: React.FC<Props> = ({ equipment, companyName = "RentFlow" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  const qrContent = JSON.stringify({
    id: equipment.id,
    name: equipment.name,
    sn: equipment.serialNumber,
    app: "RentFlow",
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, qrContent, {
      width: 160,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});

    QRCode.toDataURL(qrContent, { width: 300, margin: 2 }).then(setDataUrl).catch(() => {});
  }, [qrContent]);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=400,height=560");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Etiqueta — ${equipment.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .label {
      background: #fff;
      border: 2px solid #111;
      border-radius: 12px;
      padding: 20px 24px;
      width: 320px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,.12);
    }
    .company { font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #888; margin-bottom: 14px; }
    .qr img { width: 200px; height: 200px; }
    .name { font-size: 16px; font-weight: 700; margin-top: 14px; color: #111; }
    .meta { font-size: 11px; color: #555; margin-top: 4px; }
    .serial { font-size: 10px; font-family: monospace; color: #888; margin-top: 10px; letter-spacing: .08em; }
    @media print {
      body { background: none; }
      .label { box-shadow: none; border: 2px solid #111; }
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="company">${companyName}</div>
    <div class="qr"><img src="${dataUrl}" alt="QR Code" /></div>
    <div class="name">${equipment.name}</div>
    <div class="meta">${equipment.brand}${equipment.model ? " " + equipment.model : ""} • ${equipment.category}</div>
    <div class="serial">S/N: ${equipment.serialNumber || "—"}</div>
    <div class="serial" style="margin-top:4px">ID: ${equipment.id}</div>
  </div>
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-surface/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground flex items-center gap-1.5">
          <QrCode className="h-3.5 w-3.5" />
          Etiqueta QR
        </p>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handlePrint} disabled={!dataUrl}>
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Imprimir
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <canvas ref={canvasRef} className="rounded-lg border border-border/40 shrink-0" />
        <div className="space-y-1 text-xs text-muted-foreground min-w-0">
          <p className="font-medium text-foreground truncate">{equipment.name}</p>
          <p>{equipment.brand}{equipment.model ? ` ${equipment.model}` : ""}</p>
          <p>{equipment.category}</p>
          {equipment.serialNumber && (
            <p className="font-mono text-[10px] bg-muted/40 rounded px-1.5 py-0.5 w-fit break-all">{equipment.serialNumber}</p>
          )}
          <p className="font-mono text-[10px] text-muted-foreground/60 break-all">{equipment.id}</p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground/60">
        Escaneie para identificar o equipamento no estoque.
      </p>
    </div>
  );
};
