
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

interface ImageCropModalProps {
  image: File;
  onConfirm: (croppedImage: File) => void;
  onCancel: () => void;
  aspect?: number;

  initialCrop: { x: number; y: number };
  initialZoom: number;
  onViewChange: (
    crop: { x: number; y: number },
    zoom: number
  ) => void;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Generar la imagen recortada
const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  originalFile: File,
): Promise<File> => {
  const imageElement = new Image();

  const imageLoaded = new Promise<void>((resolve, reject) => {
    imageElement.onload = () => resolve();
    imageElement.onerror = () =>
      reject(new Error("No se pudo cargar la imagen"));
  });

  imageElement.src = imageSrc;

  await imageLoaded;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo procesar la imagen");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  context.drawImage(
    imageElement,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("No se pudo generar la imagen"));
        }
      },
      originalFile.type,
      0.92,
    );
  });

  const fileName = originalFile.name.replace(/\.[^/.]+$/, "");
  const extension = originalFile.name.split(".").pop() || "jpg";

  return new File(
    [blob],
    `${fileName}-editada.${extension}`,
    {
      type: originalFile.type,
      lastModified: Date.now(),
    },
  );
};

function ImageCropModal({
  image,
  onConfirm,
  onCancel,
  aspect = 4 / 2.4,
  initialCrop,
  initialZoom,
  onViewChange,
}: ImageCropModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [crop, setCrop] = useState(initialCrop);
const [zoom, setZoom] = useState(initialZoom);

  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CroppedAreaPixels | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(image);

    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  const handleConfirm = async () => {
    if (!imageUrl || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);

      const croppedImage = await getCroppedImage(
        imageUrl,
        croppedAreaPixels,
        image,
      );

      onConfirm(croppedImage);
    } catch (error) {
      console.error("Error al recortar la imagen:", error);
      alert("No se pudo procesar la imagen seleccionada.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">

        <h2 className="text-xl font-bold text-mint-darker">
          Ajustar imagen del platillo
        </h2>

        <p className="mt-2 text-sm text-text-primary">
          Arrastra la imagen para acomodarla y utiliza el zoom
          para acercarla o alejarla.
        </p>

        {/* Área de recorte */}
        <div className="relative mt-5 h-72 w-full overflow-hidden rounded-xl bg-gray-900">

          {imageUrl ? (
            <Cropper
  image={imageUrl}
  crop={crop}
  zoom={zoom}
  aspect={aspect}
  onCropChange={(newCrop) => {
    setCrop(newCrop);
    onViewChange(newCrop, zoom);
  }}
  onZoomChange={(newZoom) => {
    setZoom(newZoom);
    onViewChange(crop, newZoom);
  }}
  onCropComplete={(_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }}
/>
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              Cargando imagen...
            </div>
          )}

        </div>

        {/* Control de zoom */}
        <div className="mt-6">

          <div className="mb-2 flex justify-between">
            <label
              htmlFor="imageZoom"
              className="text-sm font-semibold text-text-primary"
            >
              Zoom
            </label>

            <span className="text-sm text-text-primary">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <input
            id="imageZoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) =>
              setZoom(Number(event.target.value))
            }
            className="w-full cursor-pointer accent-mint-dark"
          />

        </div>

        {/* Botones */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-lg border border-mint-dark px-5 py-2 font-semibold text-mint-dark hover:bg-mint-dark/10 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              !imageUrl ||
                !croppedAreaPixels
              }
            className="rounded-lg bg-mint-dark px-5 py-2 font-semibold text-white hover:bg-mint-darker disabled:opacity-50"
          >
            {isProcessing
              ? "Procesando..."
              : "Confirmar imagen"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ImageCropModal;
