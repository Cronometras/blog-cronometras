import { humanize } from "@/lib/utils/textConverter";
import * as Icon from "react-feather";
import { markdownify } from "@/lib/utils/textConverter";

const HomepageFeature = ({ feature_list }) => {
  return (
    <div className="key-feature-grid mt-10 grid grid-cols-2 gap-7 md:grid-cols-2 xl:grid-cols-3 ">
      {feature_list.map((item, i) => {
        // Asegurarse de que el nombre del icono sea válido y exista
        const iconName = humanize(item.icon?.replace("_", ""));
        const IconComponent = iconName && Icon[iconName];

        return (
          <div
            key={i}
            className="flex flex-col justify-between rounded-lg bg-surface p-4 shadow-lg hover:shadow-xl hover:shadow-secondary/50 transition-all hover:scale-105"
          >
            <div>
              <div className="flex flex-row items-center">
                <span className="icon">
                  {IconComponent ? <IconComponent size={20} /> : null}
                </span>
                <h3 className="ml-2 break-all text-sm md:text-lg">{item.title}</h3>
              </div>
              <p dangerouslySetInnerHTML={{__html: markdownify(item.content)}}></p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HomepageFeature;
