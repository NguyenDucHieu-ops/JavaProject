package com.example.demo.helper;

import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.repository.CategoryRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ExcelHelper {
    public static String TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    static String[] PRODUCT_HEADERS = { "Name", "Description", "Price", "Quantity", "Category_Id" };
    static String SHEET_PRODUCTS = "Products";
    static String SHEET_CATEGORIES = "Categories"; // 🌟 Yêu cầu nâng cao: 2 sheet

    // Kiểm tra file có phải Excel
    public static boolean hasExcelFormat(MultipartFile file) {
        return TYPE.equals(file.getContentType());
    }

    // 🔽 Export Excel (với 2 sheet)
    public static ByteArrayInputStream dataToExcel(List<ProductEntity> products, List<CategoryEntity> categories) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream();) {

            // --- Sheet 1: Products ---
            Sheet productSheet = workbook.createSheet(SHEET_PRODUCTS);
            // Header
            Row productHeaderRow = productSheet.createRow(0);
            for (int col = 0; col < PRODUCT_HEADERS.length; col++) {
                Cell cell = productHeaderRow.createCell(col);
                cell.setCellValue(PRODUCT_HEADERS[col]);
            }

            // Data
            int rowIdx = 1;

            // 🌟 SỬA: Thêm kiểm tra products != null
            if (products != null) {
                for (ProductEntity p : products) {
                    // 🌟 SỬA: Thêm kiểm tra p != null (đề phòng list chứa null)
                    if (p == null)
                        continue;

                    Row row = productSheet.createRow(rowIdx++);

                    row.createCell(0).setCellValue(p.getName() != null ? p.getName() : "");
                    row.createCell(1).setCellValue(p.getDescription() != null ? p.getDescription() : "");
                    row.createCell(2).setCellValue(p.getPrice() != null ? p.getPrice().doubleValue() : 0.0);
                    row.createCell(3).setCellValue(p.getQuantity() != null ? p.getQuantity() : 0);
                    row.createCell(4).setCellValue(
                            p.getCategory() != null && p.getCategory().getId() != null ? p.getCategory().getId() : 0L);
                }
            }

            // --- Sheet 2: Categories (Yêu cầu nâng cao) ---
            Sheet categorySheet = workbook.createSheet(SHEET_CATEGORIES);
            // Header
            Row categoryHeaderRow = categorySheet.createRow(0);
            categoryHeaderRow.createCell(0).setCellValue("Category_Id");
            categoryHeaderRow.createCell(1).setCellValue("Category_Name");

            // Data
            rowIdx = 1;

            // 🌟 SỬA: Thêm kiểm tra categories != null
            if (categories != null) {
                for (CategoryEntity c : categories) {
                    // 🌟 SỬA: Thêm kiểm tra c != null
                    if (c == null)
                        continue;

                    Row row = categorySheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(c.getId() != null ? c.getId() : 0L);
                    row.createCell(1).setCellValue(c.getName() != null ? c.getName() : "");
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Fail to export data to Excel file: " + e.getMessage());
        } catch (Exception e) { // Bắt Exception chung để debug
            throw new RuntimeException("Error during Excel export: " + e.getMessage(), e);
        }
    }

    // 🔼 Import Excel (chỉ đọc sheet "Products")
    public static List<ProductEntity> excelToProducts(InputStream is, CategoryRepository categoryRepo) {
        try {
            Workbook workbook = new XSSFWorkbook(is);
            Sheet sheet = workbook.getSheet(SHEET_PRODUCTS);
            if (sheet == null) {
                throw new RuntimeException("Sheet 'Products' not found!");
            }
            Iterator<Row> rows = sheet.iterator();
            List<ProductEntity> products = new ArrayList<>();

            int rowNumber = 0;
            while (rows.hasNext()) {
                Row currentRow = rows.next();
                // Bỏ qua header
                if (rowNumber == 0) {
                    rowNumber++;
                    continue;
                }

                ProductEntity product = new ProductEntity();

                // 🌟 SỬA LỖI TYPO: MissingCellGellPolicy -> MissingCellPolicy
                product.setName(currentRow.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL) != null
                        ? currentRow.getCell(0).getStringCellValue()
                        : null);
                product.setDescription(currentRow.getCell(1, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL) != null
                        ? currentRow.getCell(1).getStringCellValue()
                        : null);
                product.setPrice(currentRow.getCell(2, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL) != null
                        ? BigDecimal.valueOf(currentRow.getCell(2).getNumericCellValue())
                        : BigDecimal.ZERO);
                product.setQuantity(currentRow.getCell(3, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL) != null
                        ? (int) currentRow.getCell(3).getNumericCellValue()
                        : 0);

                // Tìm Category
                Long categoryId = (currentRow.getCell(4, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL) != null)
                        ? (long) currentRow.getCell(4).getNumericCellValue()
                        : null;
                if (categoryId != null && categoryId > 0) {
                    CategoryEntity category = categoryRepo.findById(categoryId)
                            .orElse(null); // Bỏ qua nếu không tìm thấy
                    product.setCategory(category);
                }

                // Chỉ thêm nếu có tên và category
                if (product.getName() != null && !product.getName().isEmpty() && product.getCategory() != null) {
                    products.add(product);
                }
            }
            workbook.close();
            return products;
        } catch (IOException e) {
            throw new RuntimeException("Fail to parse Excel file: " + e.getMessage());
        }
    }
}
