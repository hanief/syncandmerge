import type { SyncChange } from "../types"
import { formatFieldName } from "../utils/format"
import { renderSyncValue } from "../utils/syncValue"
import { CHANGE_STYLES } from "../constants/changeStyles"
import { MaterialIcon } from "./MaterialIcon"

type Resolution = NonNullable<SyncChange["resolution"]>

interface ChangeCardProps {
  change: SyncChange
  onResolve: (
    changeId: string,
    resolution: Resolution,
    customValue?: SyncChange["custom_value"],
  ) => void
}

export function ChangeCard({ change, onResolve }: ChangeCardProps) {
  return (
    <div
      className={`bg-surface-container-low rounded-xl p-3 transition-all ${
        change.resolved
          ? "border-2 border-success"
          : "border border-error-container/30"
      }`}
    >
      <ChangeCardHeader change={change} />
      {change.change_type === "UPDATE" && (
        <UpdateCardBody change={change} onResolve={onResolve} />
      )}
      {change.change_type === "ADD" && (
        <AddCardBody change={change} onResolve={onResolve} />
      )}
      {change.change_type === "DELETE" && (
        <DeleteCardBody change={change} onResolve={onResolve} />
      )}
    </div>
  )
}

function ChangeCardHeader({ change }: { change: SyncChange }) {
  const styles = CHANGE_STYLES[change.change_type]
  return (
    <div className="flex items-center gap-2 mb-3">
      <MaterialIcon
        name={change.resolved ? "check_circle" : styles.iconName}
        filled
        className={`text-[18px] ${change.resolved ? "text-success" : styles.color}`}
      />
      <span className="font-label text-sm font-bold text-on-surface flex-1">
        {formatFieldName(change.field_name)}
      </span>
      <span
        className={`px-2 py-0.5 rounded-full font-label text-xs font-semibold ${styles.badge}`}
      >
        {change.change_type}
      </span>
      {change.resolved && (
        <span className="px-2 py-0.5 rounded-full bg-success-container text-on-success-container font-label text-xs font-semibold">
          ✓ Resolved
        </span>
      )}
    </div>
  )
}

function UpdateCardBody({ change, onResolve }: ChangeCardProps) {
  const selectedLocal = change.resolution === "keep_current"
  const selectedExternal = change.resolution === "accept_new"

  return (
    <div className="grid grid-cols-2 gap-2">
      <SelectableValue
        selected={selectedLocal}
        heading="Local"
        action={selectedLocal ? "✓ Selected" : "Keep"}
        value={change.current_value}
        onClick={() => onResolve(change.id, "keep_current")}
      />
      <SelectableValue
        selected={selectedExternal}
        heading="External"
        action={selectedExternal ? "✓ Selected" : "Accept"}
        value={change.new_value}
        onClick={() => onResolve(change.id, "accept_new")}
      />
    </div>
  )
}

interface SelectableValueProps {
  selected: boolean
  heading: string
  action: string
  value: SyncChange["current_value"]
  onClick: () => void
}

function SelectableValue({
  selected,
  heading,
  action,
  value,
  onClick,
}: SelectableValueProps) {
  return (
    <div
      className={`rounded-lg p-3 border-2 transition-colors cursor-pointer ${
        selected
          ? "border-on-tertiary-container bg-surface-container-highest"
          : "border-transparent bg-surface-container-highest hover:border-on-tertiary-container/30"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="font-label text-xs font-semibold text-on-surface-variant">
          {heading}
        </h4>
        <span
          className={`font-label text-xs font-semibold ${selected ? "text-on-tertiary-container" : "text-on-surface-variant"}`}
        >
          {action}
        </span>
      </div>
      <div className="font-body text-xs text-on-surface p-2 bg-surface rounded wrap-break-word">
        {renderSyncValue(value)}
      </div>
    </div>
  )
}

function AddCardBody({ change, onResolve }: ChangeCardProps) {
  const rejected = change.resolution === "keep_current"
  const accepted = change.resolution === "accept_new"

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container-highest rounded-lg p-2.5">
        <span className="font-label text-xs text-on-surface-variant mr-2">
          New:
        </span>
        <span className="font-body text-xs text-on-surface wrap-break-word">
          {renderSyncValue(change.new_value)}
        </span>
      </div>
      <ActionButton
        icon="block"
        active={rejected}
        activeClass="bg-error-container text-on-error-container"
        label={rejected ? "✓ Rejected" : "Reject"}
        onClick={() => onResolve(change.id, "keep_current")}
      />
      <ActionButton
        icon="add_circle"
        active={accepted}
        activeClass="bg-on-tertiary-container text-on-primary"
        label={accepted ? "✓ Accepted" : "Accept"}
        onClick={() => onResolve(change.id, "accept_new")}
      />
    </div>
  )
}

function DeleteCardBody({ change, onResolve }: ChangeCardProps) {
  const keeping = change.resolution === "keep_current"
  const deleting = change.resolution === "accept_new"

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-container-highest rounded-lg p-2.5">
        <span className="font-label text-xs text-on-surface-variant mr-2">
          Current:
        </span>
        <span
          className={`font-body text-xs wrap-break-word ${deleting ? "line-through text-on-surface-variant" : "text-on-surface"}`}
        >
          {renderSyncValue(change.current_value)}
        </span>
      </div>
      <ActionButton
        icon="keep"
        active={keeping}
        activeClass="bg-on-tertiary-container text-on-primary"
        label={keeping ? "✓ Keeping" : "Keep"}
        onClick={() => onResolve(change.id, "keep_current")}
      />
      <ActionButton
        icon="delete"
        active={deleting}
        activeClass="bg-error-container text-on-error-container"
        label={deleting ? "✓ Deleting" : "Delete"}
        onClick={() => onResolve(change.id, "accept_new")}
      />
    </div>
  )
}

interface ActionButtonProps {
  icon: string
  active: boolean
  activeClass: string
  label: string
  onClick: () => void
}

function ActionButton({
  icon,
  active,
  activeClass,
  label,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-label text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
        active
          ? activeClass
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">{icon}</span>
      {label}
    </button>
  )
}
