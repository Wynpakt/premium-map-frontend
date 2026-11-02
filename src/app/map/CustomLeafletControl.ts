import * as L from "leaflet";

const REPORT_SHOP_LABEL = "Verkaufsstelle melden";

export function createCornerActionsControl(onReport: () => void, onInfo: () => void) {
    return L.Control.extend({
        options: {
            position: "bottomright",
        },
        onAdd: () => {
            const container = L.DomUtil.create("div", "leaflet-control map-corner-actions");
            const report = L.DomUtil.create("button", "report-shop", container) as HTMLButtonElement;
            report.type = "button";
            report.textContent = REPORT_SHOP_LABEL;

            const info = L.DomUtil.create("div", "leaflet-bar map-info-button", container);
            info.setAttribute("role", "button");
            info.setAttribute("aria-label", "Impressum");
            info.innerHTML = `<i class="fa fa-info" aria-hidden="true"></i>`;

            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            report.onclick = (event) => {
                event.preventDefault();
                onReport();
            };
            info.onclick = (event) => {
                event.preventDefault();
                onInfo();
            };
            return container;
        },
    });
}

export function createCustomLeafletControl(position: L.ControlPosition, fontAwesomeIconName: string, onClick: GlobalEventHandlers["onclick"]) {
    return L.Control.extend({
        options: {
            position,
        },
        onAdd: () => {
            const container = L.DomUtil.create(
                "div",
                "leaflet-bar leaflet-control leaflet-control-custom",
            );
            container.style.backgroundColor = "white";
            container.style.width = "30px";
            container.style.height = "30px";
            container.innerHTML = `<i class="fa fa-${fontAwesomeIconName}" aria-hidden="true"></i>`;
            container.style.fontFamily = "icomoon";
            container.style.fontSize = "100%";
            container.style.textAlign = "center";
            container.style.fontWeight = "700";
            container.style.fontSize = "20px";
            container.style.cursor = "pointer";
            container.onclick = onClick;
            return container;
        },
    });
}
