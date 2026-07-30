"use client";

import { useState } from "react";
import { Filter, Search } from "lucide-react";

type ResourceLink = {
  label: string;
  url: string;
};

type Resource = {
  id: string;
  title: string;
  category: string;
  introduction: string;
  paragraphs: string[];
  tips: string[];
  links: ResourceLink[];
};

const resources: Resource[] = [
  {
    id: "budgeting",
    title: "Budgeting",
    category: "Money Management",
    introduction:
      "A budget is a simple plan that helps students understand how much money they receive, where their money is spent, and how much money remains.",
    paragraphs: [
      "Students can begin by listing their regular income, such as wages, scholarships, or Student Allowance. They can then compare their income with regular expenses such as rent, groceries, transport, utilities, and study costs.",
      "Tracking actual spending is important because planned expenses and real spending may be different. Reviewing a budget regularly can help students identify unnecessary spending and prepare for unexpected costs.",
    ],
    tips: [
      "Separate essential and optional expenses.",
      "Set aside some money for unexpected costs.",
      "Review your budget when your income or expenses change.",
    ],
    links: [
      {
        label: "Sorted – Budgeting",
        url: "https://sorted.org.nz/guides/planning-and-budgeting/",
      },
    ],
  },
  {
    id: "scholarship-applications",
    title: "Scholarship Applications",
    category: "Student Support",
    introduction:
      "Scholarships can help students cover tuition fees, living costs, course materials, and other study-related expenses.",
    paragraphs: [
      "Scholarship requirements are different depending on the provider. Some scholarships consider academic results, while others may consider financial circumstances, community involvement, leadership, or the subject being studied.",
      "Students should carefully read the eligibility requirements and prepare all required documents before the closing date. Common documents may include academic records, personal statements, references, and evidence of achievements.",
    ],
    tips: [
      "Check the scholarship closing date early.",
      "Read all eligibility requirements carefully.",
      "Ask someone to review your application before submitting it.",
    ],
    links: [
      {
        label: "AUT Scholarships",
        url: "https://www.aut.ac.nz/study/fees-and-scholarships/scholarships-and-awards-at-aut",
      },
    ],
  },
  {
    id: "student-allowance",
    title: "Student Allowance",
    category: "Student Support",
    introduction:
      "Student Allowance is financial support that may help eligible students with their living costs while studying.",
    paragraphs: [
      "Eligibility may depend on factors such as the student's age, study programme, income, parents' income, relationship status, and living situation.",
      "Students should apply early because applications and supporting documents may take time to process. Students must also report relevant changes to their circumstances.",
    ],
    tips: [
      "Apply before your study begins where possible.",
      "Prepare the required supporting documents.",
      "Report changes to your income or living situation.",
    ],
    links: [
      {
        label: "StudyLink – Student Allowance",
        url: "https://www.studylink.govt.nz/products/a-z-products/student-allowance/index.html",
      },
    ],
  },
  {
    id: "managing-remittances",
    title: "Managing Remittances",
    category: "Money Transfer",
    introduction:
      "A remittance is money transferred to another person, often between different countries.",
    paragraphs: [
      "International money transfers may include transfer fees, exchange-rate differences, and receiving fees. The amount received may therefore be lower than the amount originally sent.",
      "Before making a transfer, students should compare the total cost, expected delivery time, exchange rate, and security of the transfer provider.",
    ],
    tips: [
      "Compare the final amount that the recipient will receive.",
      "Check transfer fees and exchange rates.",
      "Use a trusted and secure transfer provider.",
    ],
    links: [
      {
        label: "Consumer Protection New Zealand",
        url: "https://www.consumerprotection.govt.nz/",
      },
    ],
  },
  {
    id: "currency-conversions",
    title: "Currency Conversions",
    category: "Money Transfer",
    introduction:
      "Currency conversion is the process of changing money from one currency into another currency.",
    paragraphs: [
      "Currency exchange rates can change over time. Banks and transfer providers may also use different exchange rates and charge additional fees.",
      "Students receiving money from overseas should check both the advertised exchange rate and any transaction fees before completing a currency conversion.",
    ],
    tips: [
      "Check the current exchange rate.",
      "Look for additional conversion or transfer fees.",
      "Compare more than one provider before transferring money.",
    ],
    links: [
      {
        label: "Reserve Bank of New Zealand",
        url: "https://www.rbnz.govt.nz/",
      },
    ],
  },
  {
    id: "nz-living-costs",
    title: "Dealing With New Zealand Living Costs",
    category: "Living Costs",
    introduction:
      "Living costs in New Zealand may include accommodation, food, transport, utilities, communication, healthcare, and study-related expenses.",
    paragraphs: [
      "Living costs can vary depending on the location, type of accommodation, transport needs, and personal spending habits. Students living in a major city may experience different costs from students living in a smaller town.",
      "Students can manage living costs by planning regular expenses, comparing prices, preparing meals at home, using student discounts, and tracking spending through a budget.",
    ],
    tips: [
      "Plan for regular weekly and monthly expenses.",
      "Use student discounts where available.",
      "Keep some savings for unexpected expenses.",
    ],
    links: [
      {
        label: "Immigration New Zealand – Cost of Living",
        url: "https://www.immigration.govt.nz/live/moving-to-new-zealand/cost-of-living-in-new-zealand/",
      },
    ],
  },
  {
    id: "part-time-job-tax",
    title: "Part-Time Jobs and Tax",
    category: "Income and Tax",
    introduction:
      "Students working part-time in New Zealand generally need an IRD number and the correct tax code.",
    paragraphs: [
      "Employers normally deduct tax from wages before paying employees. The tax code used may depend on whether the job is the student's main source of income or an additional source of income.",
      "Students should check their payslips and make sure that their personal information and tax code are correct. Students with more than one source of income may need to use different tax codes.",
    ],
    tips: [
      "Apply for an IRD number before beginning work.",
      "Use the correct tax code.",
      "Check your payslips and income records.",
    ],
    links: [
      {
        label: "Inland Revenue – Individuals",
        url: "https://www.ird.govt.nz/individuals",
      },
    ],
  },
];

export default function ResourcesPage() {
  const [searchText, setSearchText] = useState("");

  const filteredResources = resources.filter((resource) => {
    const searchValue = searchText.trim().toLowerCase();

    if (searchValue === "") {
      return true;
    }

    return (
      resource.title.toLowerCase().includes(searchValue) ||
      resource.category.toLowerCase().includes(searchValue) ||
      resource.introduction.toLowerCase().includes(searchValue) ||
      resource.paragraphs.some((paragraph) =>
        paragraph.toLowerCase().includes(searchValue)
      ) ||
      resource.tips.some((tip) => tip.toLowerCase().includes(searchValue))
    );
  });

  return (
    <div className="min-h-screen w-full max-w-[900px] bg-white px-8 py-8 text-black dark:bg-black dark:text-white">
      <h1 className="mb-10 text-2xl">Welcome back &lt;user&gt;</h1>

      {/* Search and filter area */}
      <div className="mb-5 rounded-lg border border-zinc-200 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search Resources"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-black outline-none focus:border-blue-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white"
            />

            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
          </div>

          <button
            type="button"
            title="Filter functionality will be added in the next stage"
            className="flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <Filter size={18} />
            Filter
          </button>
        </div>

        {searchText.trim() !== "" && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            {filteredResources.length} resource
            {filteredResources.length === 1 ? "" : "s"} found
          </p>
        )}
      </div>

      {/* Resource links */}
      <section className="mb-5 rounded-lg border border-zinc-200 bg-zinc-100 p-5 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-4 text-2xl font-bold">Links</h2>

        {filteredResources.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No matching resource links were found.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={`#${resource.id}`}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-blue-600 underline hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-blue-400 dark:hover:bg-zinc-700"
              >
                {resource.title}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Resource articles */}
      <div className="space-y-5">
        {filteredResources.length === 0 && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-2 text-xl font-bold">No resources found</h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Try searching with a different word or category.
            </p>
          </div>
        )}

        {filteredResources.map((resource) => {
          const originalIndex = resources.findIndex(
            (item) => item.id === resource.id
          );

          return (
            <article
              id={resource.id}
              key={resource.id}
              className="scroll-mt-6 rounded-lg border border-zinc-200 bg-zinc-100 p-6 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {resource.category}
                </p>

                <h2 className="text-3xl font-bold">
                  {originalIndex + 1}. {resource.title}
                </h2>
              </div>

              <p className="mb-4 leading-7 text-zinc-700 dark:text-zinc-200">
                {resource.introduction}
              </p>

              {resource.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={`${resource.id}-paragraph-${paragraphIndex}`}
                  className="mb-4 leading-7 text-zinc-700 dark:text-zinc-200"
                >
                  {paragraph}
                </p>
              ))}

              <div className="mb-5 rounded-lg border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950">
                <h3 className="mb-2 font-bold">Useful Tips</h3>

                <ul className="list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-200">
                  {resource.tips.map((tip, tipIndex) => (
                    <li key={`${resource.id}-tip-${tipIndex}`}>{tip}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-bold">External Links</h3>

                <div className="flex flex-col gap-2">
                  {resource.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}