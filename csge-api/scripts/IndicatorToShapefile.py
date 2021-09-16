# -*- coding: utf-8 -*-
# Output the selected indicator in the selected language to a shapefile
# Note --> as a published service, this will output JSON or GeoJSON.

import arcpy
import os
import sys

# To allow overwriting the outputs change the overwrite option to true.
arcpy.env.overwriteOutput = True

# Set Geoprocessing environments
scratch_path = arcpy.env.scratchGDB

# Database connection
script_path = sys.path[0]
one_folder_up = os.path.dirname(script_path)
csge_sde = os.path.join(one_folder_up, "Data", "CSGE.sde")


def prepare_dguids(dguids):
    # dguids are comma separated, strip any space,",' and add single quotes 
    # this may not be necessary if dguids are coming in properly formatted
    dguids = dguids.replace('"', '').replace("'", "").replace(" ", "") 
    dguid_list = dguids.split(',') # convert to list
    
    quoted_dguids = str(dguid_list)[1:-1] # convert to quoted comma sep string
    
    return quoted_dguids
    

def indicator_to_shapefile(OutputShp, IndicatorID, Language, DGUIDs):

    # prepare DGUIDs if present
    dguid_str = prepare_dguids(DGUIDs)

    # Get Primary Query from DB
    pq_rows = arcpy.TableSelect_analysis(
        in_table=os.path.join(csge_sde, "STC_DV.gis.IndicatorMetaData"), 
        out_table=os.path.join(scratch_path, "ind_sel"), 
        where_clause="IndicatorId = " + IndicatorID
    )
       
    # Get first row value of PrimaryQuery column
    pq_query_str = ""
    with arcpy.da.SearchCursor(pq_rows, ["PrimaryQuery"]) as cursor:
        for row in cursor:
            pq_query_str = row[0]
            if DGUIDs != "":
                pq_query_str += " WHERE grfi.GeographyReferenceID IN (" + dguid_str + ") "
            
    # Make Query Layer from result of primary query
    sr = arcpy.SpatialReference(3857) # WGS_1984_Web_Mercator_Auxiliary_Sphere
    all_polys = arcpy.MakeQueryLayer_management(input_database=csge_sde, 
        out_layer_name=os.path.join(scratch_path, "all_polys.shp"), 
        query=pq_query_str, oid_fields="GeographyReferenceID", 
        shape_type="POLYGON", spatial_reference=sr)
        
   # turn query layer into feature layer (required for altering fields)
    copied_lyr = os.path.join(scratch_path, "copied_lyr")
    arcpy.CopyFeatures_management(all_polys, copied_lyr)
            
    # select and rename fields to be exported based on language selection
    # note special characters are automatically changed to _ by arcpy
    field_dict = { 
        "OBJECTID": "OBJECTID", 
        "Shape": "Shape", 
        "Shape_Length": "Shape_Length", 
        "Shape_Area": "Shape_Area"
    }
    if Language == "en":
        field_dict["GeographyReferenceId"] = "DGUID"
        field_dict["DisplayNameLong_EN"] = "Location" # DisplayN_2
        field_dict["ProvTerrName_EN"] = "Province_Territory" # ProvTerrNa
        field_dict["Value"] = "Value"
        field_dict["NullDescription_EN"] = "Data_Comment" # NullDescri
    
    else:
        field_dict["GeographyReferenceId"] = "IDUGD" 
        field_dict["DisplayNameLong_FR"] = "Endroit" # DisplayN_3
        field_dict["ProvTerrName_FR"] = "Province_Territoire" # ProvTerr_1
        field_dict["Value"] = "Valeur" 
        field_dict["NullDescription_FR"] = "Commentaire" # NullDesc_1
    
    # Delete any fields not needed for output, rename the others as per dict
    for f in arcpy.ListFields(copied_lyr):
        if f.name not in (field_dict).keys():
            arcpy.management.DeleteField(copied_lyr, f.name)
        else:
            arcpy.management.AlterField(copied_lyr, f.name, field_dict[f.name])   
    
    # Select polygons to output (output becomes JSON when service is published)
    selected_polys = arcpy.Select_analysis(copied_lyr, OutputShp) 
    
    
if __name__ == '__main__':
    args = tuple(arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()))
    indicator_to_shapefile(*args)
    

