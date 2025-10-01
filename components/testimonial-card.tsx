import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Testimonial = {
  quote: string;
  author: string;
  jobTitle?: string;
  avatarUrl?: string;
};

export function TestimonialCard({ quote, author, jobTitle, avatarUrl }: Testimonial) {
  const dynamicAvatar = avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`;
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <CardContent className="p-6">
        <figure className="h-full flex flex-col">
          <blockquote className="flex-1 text-muted-foreground leading-relaxed mb-6 relative">
            <span className="text-primary text-4xl absolute -top-2 -left-2 opacity-20">&ldquo;</span>
            <span className="relative z-10">{quote}</span>
            <span className="text-primary text-4xl absolute -bottom-4 -right-2 opacity-20">&rdquo;</span>
          </blockquote>
          <figcaption className="flex items-center gap-3 mt-auto">
            <Avatar className="h-12 w-12 border-2 border-primary/10 group-hover:border-primary/30 transition-colors duration-300">
              <AvatarImage src={dynamicAvatar} alt={`${author} avatar`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold leading-none group-hover:text-primary transition-colors duration-300">
                {author}
              </div>
              {jobTitle ? <div className="text-muted-foreground text-sm mt-1">{jobTitle}</div> : null}
            </div>
          </figcaption>
        </figure>
      </CardContent>
    </Card>
  );
}
