import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Disclosure, Menu, Popover, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { ChevronDownIcon, FilterIcon } from '@heroicons/react/solid';

const sortOptions = [
  { name: 'A -> Z', value: 'a-z' },
  { name: 'Z -> A', value: 'z-a' }
];

export interface Filter {
  id: string;
  name: string;
  options: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export type ActiveFilters = Record<string, string[]>;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Filter({
  sortFunction,
  filterFunction,
  filters = [],
  initialFilters
}: {
  sortFunction?: (sortBy: React.SetStateAction<string>, direction: 'asc' | 'desc') => void;
  filterFunction: (filters: ActiveFilters) => void;
  filters: Filter[];
  initialFilters?: ActiveFilters;
}) {
  const [activeFilters, setFilters] = useState<ActiveFilters>(initialFilters ?? {});
  const [open, setOpen] = useState(false);

  const toggleFilter = (id: string, option: FilterOption) => {
    if (!filters.some((f) => f.id === id)) {
      return;
    }

    activeFilters[id] = activeFilters[id] ?? [];

    if (activeFilters[id].includes(option.value)) {
      return setFilters({
        ...activeFilters,
        [id]: activeFilters[id].filter((value) => value !== option.value)
      });
    }

    setFilters({
      ...activeFilters,
      [id]: [...activeFilters[id], option.value]
    });
  };

  useEffect(() => {
    filterFunction(activeFilters);
  }, [activeFilters]);

  return (
    <div>
      {/* Mobile filter dialog */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              {/* TODO: ADD FILTER ICON HERE INSTEAD OF "Filters" */}
              <Dialog.Panel className="ml-auto relative max-w-xs w-full h-full bg-white shadow-xl py-4 pb-6 flex flex-col overflow-y-auto">
                <div className="px-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    <FilterIcon aria-hidden="true" />
                  </h2>
                  <button
                    type="button"
                    className="-mr-2 w-10 h-10 bg-white p-2 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4">
                  {filters.map((filter) => (
                    <Disclosure as="div" key={filter.id} className="border-t border-gray-200 px-4 py-6">
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="px-2 py-3 bg-white w-full flex items-center justify-between text-sm text-gray-400">
                              <span className="font-medium text-gray-900">{filter.name}</span>
                              <span className="ml-6 flex items-center">
                                <ChevronDownIcon
                                  className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                  aria-hidden="true"
                                />
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel className="pt-6">
                            <div className="space-y-6">
                              {filter.options.map((option, optionIdx) => (
                                <div key={optionIdx} className="flex items-center">
                                  <input
                                    id={`filter-mobile-${filter.id}-${optionIdx}`}
                                    name={`${filter.id}[]`}
                                    onChange={() => toggleFilter(filter.id, option)}
                                    defaultChecked={activeFilters[filter.id].includes(option.value)}
                                    checked={activeFilters[filter.id].includes(option.value)}
                                    type="checkbox"
                                    className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <label htmlFor={`filter-mobile-${filter.id}-${optionIdx}`} className="ml-3 text-sm text-gray-500">
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="w-full mx-auto px-4 text-center sm:px-6 lg:px-8">
        <section aria-labelledby="filter-heading" className="py-6 w-full">
          <h2 id="filter-heading" className="sr-only">
            Product filters
          </h2>

          <div className="flex items-center justify-between">
            {sortFunction ? (
              <Menu as="div" className="relative z-10 inline-block text-left">
                <div>
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sort
                    <ChevronDownIcon
                      className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-left absolute left-0 z-10 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item>
                          {({ active }) => (
                            <span
                              onClick={() => sortFunction(option.value, 'asc')}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm font-medium text-gray-900 cursor-pointer'
                              )}
                            >
                              {option.name}
                            </span>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div></div>
            )}

            <button
              type="button"
              className="inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden"
              onClick={() => setOpen(true)}
            ></button>
            <FilterIcon className="inline-block text-gray-700 hover:text-gray-900 h-8 w-8 sm:hidden" onClick={() => setOpen(true)} />

            <Popover.Group className="hidden sm:flex sm:items-baseline sm:space-x-8">
              {filters.map((filter, index) => (
                <Popover as="div" key={filter.name} id={`desktop-menu-${index}`} className="relative z-10 inline-block text-left">
                  <div>
                    <Popover.Button className="group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                      <span>{filter.name}</span>
                      <ChevronDownIcon
                        className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    </Popover.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Popover.Panel className="origin-top-right absolute right-0 mt-2 bg-white rounded-md shadow-2xl p-4 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <form className="space-y-4">
                        {filter.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              id={`filter-${filter.id}-${optionIdx}`}
                              name={`${filter.id}[]`}
                              defaultChecked={activeFilters[filter.id]?.includes(option.value)}
                              onChange={(e) => {
                                toggleFilter(filter.id, option);
                              }}
                              type="checkbox"
                              className="h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <label
                              htmlFor={`filter-${filter.id}-${optionIdx}`}
                              className="ml-3 pr-6 text-sm font-medium text-gray-900 whitespace-nowrap"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </form>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              ))}
            </Popover.Group>
          </div>
        </section>
      </div>
    </div>
  );
}
