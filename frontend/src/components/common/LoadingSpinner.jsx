export default function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex justify-center items-center p-8">
      <div className={sizes[size] + " border-3 border-lavender-light border-t-lavender rounded-full animate-spin"} style={{borderWidth:"3px"}}></div>
    </div>
  );
}