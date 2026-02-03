import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-gray-600 mt-4">
      <div className="mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4 flex flex-col items-center">
        <h1 className="font-bold text-2xl text-special-blue">Spoon</h1>
        <p className="text-xs font-light">
          A project by{" "}
          <span>
            <a
              href="macasindel-ahmer.dev"
              className="text-special-blue hover:underline"
            >
              Ahmer.
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
}
