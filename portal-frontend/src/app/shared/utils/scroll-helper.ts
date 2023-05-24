export const scrollToElement = (params: { id: string; center: boolean }) => {
  const { id, center } = params;

  const el = document.getElementById(id);

  const options: ScrollIntoViewOptions = {
    behavior: 'smooth',
    block: center ? 'center' : undefined, // DOM default: 'start'
    inline: center ? 'center' : undefined, // DOM default: 'nearest'
  };

  el?.scrollIntoView(options);
};
