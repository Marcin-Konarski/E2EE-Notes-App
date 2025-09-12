import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/NavigationMenu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";



const NavBarComponent = ({ logo, menu, auth }) => {
  return (
    <section className="py-4">
      <div className="container mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center"> {/* This is left deliberately as href instead of Link fron react router cuz there is just next to it Home button that points to home and I want to enable the possibility of full page refresh is someone wants to */}
              <img
                src={logo.src}
                className={"h-" + logo.size + " dark:invert"}
                alt={logo.alt}
              />
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={auth.login.url}>{auth.login.title}</Link>
            </Button>
            <Button asChild size="sm">
              <Link to={auth.signup.url}>{auth.signup.title}</Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {/* <a href={logo.url} className="flex items-center gap-2"> */}
            <Link to={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className={"h-" + logo.size + " dark:invert"}
                alt={logo.alt}
              />
            </Link>
            {/* </a> */}

            {/* Mobile Side Panel */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mx-4">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2"> {/* This is left deliberately as href instead of Link fron react router cuz there is just below it a Home button that points to home and I want to enable the possibility of full page refresh is someone wants to */}
                      <img
                        src={logo.src}
                        className={"h-" + logo.size + " dark:invert"}
                        alt={logo.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline">
                      {/* <a href={auth.login.url}>{auth.login.title}</a> */}
                      <Link to={auth.login.url}>{auth.login.title}</Link>
                    </Button>
                    <Button asChild>
                      {/* <a href={auth.signup.url}>{auth.signup.title}</a> */}
                      <Link to={auth.signup.url}>{auth.signup.title}</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};



const renderMenuItem = (item) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild className={cn("bg-background hover:bg-muted hover:text-accent-foreground group inline-flex",
                          "h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors")}>
        <Link to={item.url}>{item.title}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} to={item.url} className="text-md font-semibold">
      {item.title}
    </Link>
  );
};

const SubMenuLink = ({ item }) => {
  return (
    <Link to={item.url} className={cn("hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none",
                    "flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors")}>
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export { NavBarComponent };

