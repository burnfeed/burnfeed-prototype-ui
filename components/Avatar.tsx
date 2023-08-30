const DEFAULT_URL = "https://effigy.im/a";

export interface AvatarProp {
  url?: string;
  size?: number;
  address?: string;
}

export default function Avatar({ url, size, address }: AvatarProp) {
  if (size == null) size = 3;
  return (
    <div className="avatar">
      <div
        className="rounded-full"
        style={{
          width: size + "rem",
          height: size + "rem",
        }}
      >
        <img src={url ? url : `${DEFAULT_URL}/${address}`} />
      </div>
    </div>
  );
}
