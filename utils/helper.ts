export function getLongestArray(arr: any[]) {
  let n = 3;
  while (n <= arr.length) {
    let subArr = arr.slice(-n);
    let jsonStr = JSON.stringify(subArr);
    if (jsonStr.length < 2000) {
      n += 2;
    } else {
      return arr.slice(-n + 2);
    }
  }
  return arr.slice(-n + 2);
}

export const genetrateCopyButton = async () => {
  const copyButtonLabel = "Copy";

  // use a class selector if available
  let blocks = document.querySelectorAll("pre");

  blocks.forEach((block) => {
    // only add button if browser supports Clipboard API
    if (
      navigator.clipboard &&
      (block.previousSibling as HTMLButtonElement).tagName !== "BUTTON"
    ) {
      let button = document.createElement("button");
      button.classList.add("copy-button");
      button.innerText = copyButtonLabel;

      block.parentNode!.insertBefore(button, block);

      button.addEventListener("click", async () => {
        await copyCode(block, button);
      });
    }
  });

  async function copyCode(
    block: HTMLPreElement,
    button: { innerText: string } | undefined
  ) {
    let code = block.querySelector("code");
    let text = code!.innerText;

    await navigator.clipboard.writeText(text);

    // visual feedback that task is completed
    button!.innerText = "Copied";

    setTimeout(() => {
      button!.innerText = copyButtonLabel;
    }, 700);
  }
};
