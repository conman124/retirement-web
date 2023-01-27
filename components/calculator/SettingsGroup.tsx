import { MdChevronRight } from "react-icons/md";

type SettingsGroupProps = React.PropsWithChildren<{ title: string }>;

export function SettingsGroup(props: SettingsGroupProps) {
  return (
    <div>
      <h2 className="font-bold text-lg border-b border-base-300 p-3 pl-4 text-accent">
        {props.title}
      </h2>
      {props.children}
    </div>
  );
}

type SettingProps = React.PropsWithChildren<{ name: string; subtext?: string }>;

export function Setting(props: SettingProps) {
  return (
    <div className="border-b border-base-200 p-2 pl-4 flex">
      <div className="grow">
        <div className="font-bold">{props.name}</div>
        <div className="text-neutral text-sm">{props.subtext}</div>
      </div>
      <div>{props.children}</div>
    </div>
  );
}

type EditButtonProps = { onClick?: React.MouseEventHandler<HTMLElement> };

export function EditButton(props: EditButtonProps) {
  return (
    <button
      onClick={props.onClick}
      className="text-accent hover:underline cursor-pointer whitespace-nowrap flex items-center justify-center"
    >
      Edit
      <MdChevronRight />
    </button>
  );
}
