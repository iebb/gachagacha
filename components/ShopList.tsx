"use client";

import { MapPin, Phone, Clock, Navigation } from "lucide-react";

interface Shop {
  _id: string;
  sort: [string, number];
  _source: {
    name: string;
    address1: string;
    tel: string;
    operating_hours: string;
    access: string;
    thumb: string;
    maker: string;
    etc1: string;
  };
}

interface ShopListProps {
  shops: Shop[];
  currentBarcode?: string;
}

export default function ShopList({ shops, currentBarcode }: ShopListProps) {
  const formatDistance = (sortValue: [string, number]) => {
    if (sortValue && sortValue[1]) {
      return `${sortValue[1].toFixed(1)} km away`;
    }
    return "Distance unknown";
  };

  const getAvailableAmount = (maker: string, barcode: string) => {
    try {
      if (!maker || !barcode) return null;
      const makerData = JSON.parse(maker);
      const key = `z${barcode}`;
      return makerData[key] || null;
    } catch (error) {
      console.error("Error parsing maker data:", error);
      return null;
    }
  };

  const formatOperatingHours = (hours: string) => {
    if (!hours) return "Hours not available";
    return hours.replace(/\\n/g, "<br/>").trim();
  };

  const formatAccess = (access: string) => {
    if (!access) return "Access information not available";
    return access.replace(/\\n/g, "<br/>").trim();
  };

  const parseEtc1 = (etc1: string) => {
    try {
      if (!etc1) return null;
      return JSON.parse(etc1);
    } catch (error) {
      console.error("Error parsing etc1:", error);
      return null;
    }
  };

  const renderHtmlSafely = (htmlString: string) => {
    // Basic sanitization - only allow safe HTML tags
    const allowedTags = [
      "div",
      "span",
      "p",
      "br",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "small",
    ];
    const allowedAttributes = ["class", "style"];

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;

    // Recursively sanitize the DOM
    const sanitizeNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.cloneNode();
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        if (!allowedTags.includes(tagName)) {
          // If tag is not allowed, just return the text content
          return document.createTextNode(element.textContent || "");
        }

        // Create a new element with the same tag
        const newElement = document.createElement(tagName);

        // Copy allowed attributes
        for (const attr of allowedAttributes) {
          if (element.hasAttribute(attr)) {
            newElement.setAttribute(attr, element.getAttribute(attr) || "");
          }
        }

        // Recursively sanitize child nodes
        for (const child of Array.from(element.childNodes)) {
          const sanitizedChild = sanitizeNode(child);
          newElement.appendChild(sanitizedChild);
        }

        return newElement;
      }

      return document.createTextNode("");
    };

    // Sanitize the entire content
    const sanitizedContent = sanitizeNode(tempDiv);

    // Convert back to HTML string
    const sanitizedDiv = document.createElement("div");
    sanitizedDiv.appendChild(sanitizedContent);
    return sanitizedDiv.innerHTML;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {shops.map((shop, index) => {
        const etc1Data = parseEtc1(shop._source.etc1);

        return (
          <div
            key={shop._id}
            className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-3 sm:gap-4">
              {/* Shop Image */}
              {shop._source.thumb && (
                <div className="flex-shrink-0">
                  <img
                    src={`https://bandainamco-am.co.jp${shop._source.thumb}`}
                    alt={shop._source.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  {/* Available Amount */}
                  {currentBarcode &&
                    (() => {
                      const availableAmount = getAvailableAmount(
                        shop._source.maker,
                        currentBarcode,
                      );
                      if (availableAmount !== null) {
                        return (
                          <div className="mt-1 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              Avail: {String(availableAmount)}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </div>
              )}

              {/* Shop Information - Compact Header */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                    {shop._source.name}
                  </h3>
                  <p className="text-primary-600 font-medium text-xs sm:text-sm">
                    {formatDistance(shop.sort)}
                  </p>
                </div>

                {/* Phone & Hours Row */}
                <div className="flex items-center gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      {etc1Data?.tel ||
                        shop._source.tel ||
                        "Phone not available"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: renderHtmlSafely(
                          formatOperatingHours(
                            etc1Data?.operating_hours ||
                              shop._source.operating_hours,
                          ),
                        ),
                      }}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mt-2 flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="text-gray-600">
                      {etc1Data?.address1 ||
                        shop._source.address1 ||
                        "Address not available"}
                    </p>
                    {etc1Data?.zipcode && (
                      <p className="text-gray-500">〒{etc1Data.zipcode}</p>
                    )}
                  </div>
                </div>

                {/* Additional Info from etc1 */}
                {etc1Data && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {etc1Data.shop_label && (
                      <div
                        className="mt-2 text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{
                          __html: renderHtmlSafely(String(etc1Data.shop_label)),
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Access - Collapsible */}
                <details className="mt-2 group">
                  <summary className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900">
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    Access Information
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 transform group-open:rotate-180 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <div className="mt-1 ml-5 text-xs sm:text-sm text-gray-600">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderHtmlSafely(
                          formatAccess(etc1Data?.access || shop._source.access),
                        ),
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      {etc1Data.fax && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Fax:{" "}
                          </span>
                          <span className="text-gray-600">{etc1Data.fax}</span>
                        </div>
                      )}
                      {etc1Data.Regular_holiday && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Holidays:{" "}
                          </span>
                          <span
                            className="text-gray-600"
                            dangerouslySetInnerHTML={{
                              __html: renderHtmlSafely(
                                String(etc1Data.Regular_holiday),
                              ),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
