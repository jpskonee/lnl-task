const express = require("express");
const PORT = 5000;
const Packages = require("./db/packages.json")
const Suppliers = require("./db/suppliers.json")
const Buyers = require("./db/buyers.json");



const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


app.get("/packages", (req, res) => {
    res.status(200).json({
        status: 200,
        description: "Shipments",
        length: Packages.length,
        data: Packages
    });
})


//Task 1
//@METOHD : GET
//@Route: "/shipments"
//@Description: Returns all the shipments associated with a specific  buyer/suplplier combination
app.get("/shipment", (req, res) => {
    const suppliersId = req.body.suppliersId
    const buyersId = req.body.buyersId

    //checking if  body data was supplied
    if (suppliersId === undefined || suppliersId.length == 0 || buyersId === undefined || buyersId.length == 0) {
        return res.status(400).json({
            status: 400,
            errorMsg: "Please provide a valid Supplier/Buyer ID"
        });
    }

    //checking if supplier is valid
    const supplier = Suppliers.filter(supplier => supplier.id === suppliersId);
    if (!supplier[0] || supplier.length === 0) {
        return res.status(404).json({
            status: 404,
            errorMsg: "Invalid Supplier/Buyer Combination"
        });
    }

    //checking if buyer is valid
    const buyer = Buyers.filter(buyer => buyer.id === buyersId)
    if (!buyer[0] || buyer.length === 0) {
        res.status(404).json({
            status: 404,
            errorMsg: "Invalid Supplier/Buyer Combination"
        });
        return;
    }

    //checking associated shipments
    const FoundShipments = Packages.filter(package => package.buyerId === buyersId && package.supplierId === suppliersId)
    if (!FoundShipments || FoundShipments.length === 0) {
        return res.status(404).json({
            status: 404,
            errorMsg: "No Shipment found for Supplier/Buyer Combination"
        });
    }

    res.status(200).json({
        status: 200,
        "totalShipments": FoundShipments.length,
        shipmentData: FoundShipments
    });
});


//Task 2
//@METOHD : GET
//@Route: "/carbon"
//@Description: Returns total Carbon Emissions for all the shipments by a specific suplplier.
app.get(("/emissions/:suppliersId"), (req, res) => {
    
    const suppliersId = req.params.suppliersId;


    //getting supplier
    const supplier = Suppliers.filter(supplier => supplier.id === suppliersId)

    // checking if supplier exist in DB
    if (!supplier[0] || supplier.length === 0) {
        return res.status(404).json({
            status: 404,
            errorMsg: "NO supplier found!"
        });
    }

    //checking if suppliers has completed any trip
    if (!supplier[0].transctionsID || supplier[0].transctionsID.length === 0) {
        return res.status(200).json({
            status: 200,
            data: "Supplier yet to complete a trip!"
        });
    };



    //Carbon emission from all supplier's shipments.
    const supplierSPackages = Packages.filter(package => package.supplierId === suppliersId);
   
    let totalTruckShipmentsEmission = 0;
    let totalRailShipmentsEmission = 0;
    supplierSPackages.map(package => {
        //shipmentTypeCode =1;truck shipment
        //shipmentTypeCode =2;Rail shipment
        if (package.shipmentTypeCode === "1") {
            const emitPerdistance = package.distance
            totalTruckShipmentsEmission = totalTruckShipmentsEmission + emitPerdistance
        } else if (package.shipmentTypeCode === "2") {
            const emitPerdistance = (package.distance * 5)
            totalRailShipmentsEmission = totalRailShipmentsEmission + emitPerdistance
        }
       
    });

    const totalCarbonEmitted = totalRailShipmentsEmission + totalTruckShipmentsEmission;
     

    res.status(200).json({
        status: 200,
        totalEmissions: totalCarbonEmitted,
        totalShipments: supplierSPackages.length,
        suppliersData: supplier
    });
});



//Task 3
//@METOHD : GET
//@Route: "/efficiency"
//@Description: Returns the supplier with the most efficient carbon emissions.
app.get(("/efficiency"), (req, res) => {

    const TotalsuplpliersEfficiencies = [];
    for (const supplier of Suppliers) {
        //getting suppliers detials
        const suplplierId = supplier.id
        let totalTruckShipmentsEmission = 0;
        let totalRailShipmentsEmission = 0;
        const supplierSPackages = Packages.filter(package => package.supplierId === suplplierId)
        
        supplierSPackages.map(package => {
            //shipmentTypeCode =1;truck shipment
            //shipmentTypeCode =2;Rail shipment
            if (package.shipmentTypeCode === "1") {
                const emitPerdistance = package.distance
                totalTruckShipmentsEmission = totalTruckShipmentsEmission + emitPerdistance
            } else if (package.shipmentTypeCode === "2") {
                const emitPerdistance = (package.distance * 5)
                totalRailShipmentsEmission = totalRailShipmentsEmission + emitPerdistance
            }       
        });
       
        const totalCarbonEmitted = totalRailShipmentsEmission + totalTruckShipmentsEmission;
        const totalShipments = supplierSPackages.length;
        const efficiency = totalCarbonEmitted / totalShipments;
        
        
        TotalsuplpliersEfficiencies.push({
            totalCarbonEmitted,
            totalShipments,
            efficiency: efficiency ? efficiency : "No trip yet",
            supplierDatails: supplier
        });
    };

    
    //sorting efficiencies
    const sortedData = TotalsuplpliersEfficiencies.sort((a, b) => {
        return a.efficiency - b.efficiency;
    });

   
    res.status(200).json({
        status: 200,
        description: "Most Efficient supplier",
        data: sortedData[0]
    });

});


///404 routes
app.get("*", (req, res) => {
    res.status(404).send("Route not Found!")
} )

app.listen(PORT, () => {
    console.log(`Server up and running on port: ${PORT}`)
});