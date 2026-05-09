interface Props {
  message: string | null;
}

export function MilestoneToast({ message }: Props) {
  if (!message) return null;
  return (
    <div className="milestone-toast">
      {message}
    </div>
  );
}
