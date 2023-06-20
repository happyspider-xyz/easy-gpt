export function AutoRun() {
  return (
    <div className="auto-run">
      <label>
        <input
          type="checkbox"
          onChange={() => {
            window.location.reload();
          }}
        />
        Disable auto run
      </label>
      <p>You need to run `Easy GPT: Open view` command to see this window</p>
    </div>
  );
}
