type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
};

export function TestimonialCard({ quote, author, role, avatarUrl }: Testimonial) {
  const dynamicAvatar = avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`;
  return (
    <figure className="rounded-lg border p-6 h-full bg-background">
      <blockquote className="text-sm text-muted-foreground">
        “{quote}”
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dynamicAvatar} alt="" className="h-9 w-9 rounded-full border bg-white" aria-hidden />
        <div className="text-sm">
          <div className="font-medium leading-none">{author}</div>
          {role ? <div className="text-muted-foreground mt-1">{role}</div> : null}
        </div>
      </figcaption>
    </figure>
  );
}
